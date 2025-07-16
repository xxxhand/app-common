/* eslint-disable no-unused-vars, no-shadow */
import { Channel, connect, ConsumeMessage, Options, ChannelModel } from 'amqplib';
import { TNullable } from './custom-definition';

export interface IQueueOptions extends Options.AssertQueue {}
export interface IExchangeOptions extends Options.AssertExchange {}
export interface IConsumeMessage extends ConsumeMessage {}
export interface IConsumeOptions extends Options.Consume {}
export interface IPublishOptions extends Options.Publish {}

export type TExchangeType = 'direct' | 'topic' | 'headers' | 'fanout' | 'match';

export type TMessageHandler<T = any> = (msg: IConsumeMessage | null, content: T) => Promise<void>;

export abstract class AbstractMQClient {
  /** Prefix for console log */
  protected errPrefix: string = '';

  /** Connection instance */
  protected conn: TNullable<ChannelModel> = null;

  /** Channel instance */
  protected channel: TNullable<Channel> = null;

  /** Current mode: producer or consumer */
  protected mode: 'producer' | 'consumer' | 'idle' = 'idle';

  /** Consumer tag for cancelling consumption */
  protected consumerTag: string = '';

  /** Connection options */
  protected opt: Options.Connect = {
    heartbeat: 60,
  };

  /** Retry configuration */
  protected retryConfig = {
    maxRetries: 5,
    retryInterval: 5000, // 5 seconds
    currentRetries: 0,
  };

  /** Flag to indicate if client is terminating */
  protected isTerminating: boolean = false;

  /** Retry timeout reference */
  // eslint-disable-next-line no-undef
  protected retryTimeout: TNullable<NodeJS.Timeout> = null;

  /** Default queue options */
  protected defaultQueueOptions: IQueueOptions = {
    durable: true,
    exclusive: false,
    autoDelete: false,
  };

  /** Default consume options */
  protected defaultConsumeOptions: IConsumeOptions = {
    noAck: false,
    exclusive: false,
  };

  /** Default publish options */
  protected defaultPublishOptions: IPublishOptions = {
    persistent: true,
  };

  /** New connection instance */
  protected async newConnection(): Promise<void> {
    this.conn = await connect(this.opt);
    this.channel = await this.conn.createChannel();
  }

  /** Try connect to rabbitmq */
  public async tryConnect(): Promise<void> {
    console.log(`${this.errPrefix} Attempting to connect to RabbitMQ at ${this.opt.hostname}:${this.opt.port}`);
    if (this.conn) {
      return;
    }
    try {
      await this.newConnection();
      console.log(`${this.errPrefix} Connection established`);

      this.conn!!.on('error', this._onError);
      this.conn!!.on('close', this._onClose);
      this.channel!!.on('error', this._onChannelError);
      this.channel!!.on('close', this._onChannelClose);

      // Reset retry counter on successful connection
      this.retryConfig.currentRetries = 0;
      console.log(`${this.errPrefix} Connected successfully`);
    } catch (error) {
      console.error(`${this.errPrefix} Failed to connect:`, error);
      throw error;
    }
  }

  /** Retry connection with exponential backoff */
  protected async retryConnection(): Promise<void> {
    if (this.isTerminating) {
      return;
    }

    if (this.retryConfig.currentRetries >= this.retryConfig.maxRetries) {
      console.error(`${this.errPrefix} Max retry attempts (${this.retryConfig.maxRetries}) reached. Giving up.`);
      return;
    }

    this.retryConfig.currentRetries += 1;
    console.log(`${this.errPrefix} Attempting to reconnect (${this.retryConfig.currentRetries}/${this.retryConfig.maxRetries}) in ${this.retryConfig.retryInterval}ms...`);

    this.retryTimeout = setTimeout(async () => {
      try {
        // Clean up existing connections
        await this.cleanupConnections();

        // Try to reconnect
        await this.newConnection();

        this.conn!!.on('error', this._onError);
        this.conn!!.on('close', this._onClose);
        this.channel!!.on('error', this._onChannelError);
        this.channel!!.on('close', this._onChannelClose);

        await new Promise<void>((res) => {
          (this.conn as ChannelModel).once('ready', () => res());
        });

        // Reset retry counter on successful reconnection
        this.retryConfig.currentRetries = 0;
        console.log(`${this.errPrefix} Reconnected successfully`);

        // If we were in consumer mode, we might need to re-establish consumption
        if (this.mode === 'consumer') {
          console.log(`${this.errPrefix} Connection restored in consumer mode`);
        }
      } catch (error) {
        console.error(`${this.errPrefix} Reconnection attempt failed:`, error);
        // Try again
        await this.retryConnection();
      }
    }, this.retryConfig.retryInterval);
  }

  /** Clean up existing connections */
  protected async cleanupConnections(): Promise<void> {
    try {
      if (this.channel) {
        this.channel.removeAllListeners();
        await this.channel.close();
        this.channel = null;
      }

      if (this.conn) {
        this.conn.removeAllListeners();
        await this.conn.close();
        this.conn = null;
      }

      this.consumerTag = '';
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  /** Run as producer mode */
  public async runAsProducer(): Promise<void> {
    if (!this.conn || !this.channel) {
      await this.tryConnect();
    }
    this.mode = 'producer';
    console.log(`${this.errPrefix} Running as producer`);
  }

  /** Run as consumer mode */
  public async runAsConsumer(): Promise<void> {
    if (!this.conn || !this.channel) {
      await this.tryConnect();
    }
    this.mode = 'consumer';
    console.log(`${this.errPrefix} Running as consumer`);
  }

  /** Assert queue exists */
  public async assertQueue(queueName: string, options?: IQueueOptions): Promise<void> {
    if (!this.channel) {
      throw new Error(`[${this.errPrefix}] Channel instance not init`);
    }

    const queueOptions = { ...this.defaultQueueOptions, ...options };
    await this.channel.assertQueue(queueName, queueOptions);
  }

  /** Publish message to queue (Producer mode) */
  public async publishToQueue(queueName: string, message: any, options?: IPublishOptions): Promise<boolean> {
    if (this.mode !== 'producer') {
      throw new Error(`[${this.errPrefix}] Client is not in producer mode`);
    }

    if (!this.channel) {
      throw new Error(`[${this.errPrefix}] Channel instance not init`);
    }

    try {
      const publishOptions = { ...this.defaultPublishOptions, ...options };
      const content = Buffer.from(JSON.stringify(message));

      return this.channel.sendToQueue(queueName, content, publishOptions);
    } catch (error) {
      console.error(`${this.errPrefix} Failed to publish message:`, error);
      throw error;
    }
  }

  /** Publish message to exchange (Producer mode) */
  public async publishToExchange(exchangeName: string, routingKey: string, message: any, options?: IPublishOptions): Promise<boolean> {
    if (this.mode !== 'producer') {
      throw new Error(`[${this.errPrefix}] Client is not in producer mode`);
    }

    if (!this.channel) {
      throw new Error(`[${this.errPrefix}] Channel instance not init`);
    }

    try {
      const publishOptions = { ...this.defaultPublishOptions, ...options };
      const content = Buffer.from(JSON.stringify(message));

      return this.channel.publish(exchangeName, routingKey, content, publishOptions);
    } catch (error) {
      console.error(`${this.errPrefix} Failed to publish to exchange:`, error);
      throw error;
    }
  }

  /** Consume messages from queue (Consumer mode) */
  public async consumeFromQueue(queueName: string, handler: TMessageHandler, options?: IConsumeOptions): Promise<void> {
    if (this.mode !== 'consumer') {
      throw new Error(`[${this.errPrefix}] Client is not in consumer mode`);
    }

    if (!this.channel) {
      throw new Error(`[${this.errPrefix}] Channel instance not init`);
    }

    try {
      const consumeOptions = { ...this.defaultConsumeOptions, ...options };

      const result = await this.channel.consume(
        queueName,
        async (msg) => {
          if (msg) {
            let content;
            try {
              content = JSON.parse(msg.content.toString());
            } catch (error) {
              content = msg.content.toString();
            }
            await handler(msg, content);
          }
        },
        consumeOptions,
      );

      this.consumerTag = result.consumerTag;
      console.log(`${this.errPrefix} Consumer started with tag: ${this.consumerTag}`);
      console.log(`${this.errPrefix} Started consuming from queue: ${queueName}`);
    } catch (error) {
      console.error(`${this.errPrefix} Failed to consume from queue:`, error);
      throw error;
    }
  }

  /** Acknowledge message (Consumer mode) */
  public ackMessage(msg: IConsumeMessage): void {
    if (this.mode !== 'consumer') {
      throw new Error(`[${this.errPrefix}] Client is not in consumer mode`);
    }

    if (!this.channel) {
      throw new Error(`[${this.errPrefix}] Channel instance not init`);
    }

    this.channel.ack(msg);
  }

  /** Reject message (Consumer mode) */
  public rejectMessage(msg: IConsumeMessage, requeue: boolean = false): void {
    if (this.mode !== 'consumer') {
      throw new Error(`[${this.errPrefix}] Client is not in consumer mode`);
    }

    if (!this.channel) {
      throw new Error(`[${this.errPrefix}] Channel instance not init`);
    }

    this.channel.reject(msg, requeue);
  }

  /** Stop consuming messages */
  public async stopConsuming(): Promise<void> {
    if (!this.channel || !this.consumerTag) {
      return;
    }

    try {
      await this.channel.cancel(this.consumerTag);
      this.consumerTag = '';
      console.log(`${this.errPrefix} Stopped consuming`);
    } catch (error) {
      console.error(`${this.errPrefix} Failed to stop consuming:`, error);
    }
  }

  /** Assert exchange exists */
  public async assertExchange(exchangeName: string, exchangeType: TExchangeType, options?: IExchangeOptions): Promise<void> {
    if (!this.channel) {
      throw new Error(`[${this.errPrefix}] Channel instance not init`);
    }

    await this.channel.assertExchange(exchangeName, exchangeType, options);
  }

  /** Bind queue to exchange */
  public async bindQueue(queueName: string, exchangeName: string, routingKey: string): Promise<void> {
    if (!this.channel) {
      throw new Error(`[${this.errPrefix}] Channel instance not init`);
    }

    await this.channel.bindQueue(queueName, exchangeName, routingKey);
  }

  /** Prefetch from channel */
  public async prefetch(count: number, global: boolean = false): Promise<void> {
    if (!this.channel) {
      throw new Error(`[${this.errPrefix}] Channel instance not init`);
    }
    if (this.mode !== 'consumer') {
      throw new Error(`[${this.errPrefix}] Client is not in consumer mode`);
    }
    const currentCount = count || 1;

    await this.channel.prefetch(currentCount, global);
    console.log(`${this.errPrefix} Prefetched ${currentCount} messages (global: ${global})`);
  }

  /** Terminate client */
  public async terminate(): Promise<void> {
    this.isTerminating = true;

    // Clear retry timeout
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    try {
      if (this.consumerTag && this.channel) {
        await this.stopConsuming();
      }

      await this.cleanupConnections();

      this.mode = 'idle';
      console.log(`${this.errPrefix} Client terminated`);
    } catch (error) {
      console.error(`${this.errPrefix} Error during termination:`, error);
    }
  }

  private _onError = (err: Error): void => {
    console.error(`${this.errPrefix} Connection error: ${err}`);
    // Trigger retry connection
    this.retryConnection();
  };

  private _onClose = (): void => {
    console.log(`${this.errPrefix} MQ client close`);
    // Trigger retry connection only if not terminating
    if (!this.isTerminating) {
      this.retryConnection();
    }
  };

  private _onChannelError = (err: Error): void => {
    console.error(`${this.errPrefix} Channel error: ${err}`);
    // Trigger retry connection
    this.retryConnection();
  };

  private _onChannelClose = (): void => {
    console.log(`${this.errPrefix} Channel close`);
    // Trigger retry connection only if not terminating
    if (!this.isTerminating) {
      this.retryConnection();
    }
  };
}
