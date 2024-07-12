import * as ioredis from 'ioredis';
import { TNullable } from './custom-definition';

export abstract class TRedisClient {
  /** Prefix for console log */
  protected errPrefix: string = '';

  /** Connection options */
  protected opt: ioredis.RedisOptions = {
    host: '127.0.0.1',
    port: 6379,
    password: '',
    db: 0,
  };

  /** Mongoose instance */
  protected instance: TNullable<ioredis.Redis> = null;

  /** The redis instance of this client */
  public get theInstance(): ioredis.Redis {
    if (!this.instance) {
      throw new Error(`[${this.errPrefix}] Redis instance not init`);
    }
    return this.instance;
  }

  /** Create client */
  public async create(): Promise<void> {
    this.instance = new ioredis.Redis(this.opt);
    this.instance.on('connect', this._onConnected);
    this.instance.on('error', this._onError);
    this.instance.on('close', this._onClose);
  }

  /** Get instance status */
  public isConnected(): boolean {
    return this.instance ? this.instance.status === 'connect' : false;
  }

  private _onError = (err: Error): void => {
    console.error(`${this.errPrefix} ${err}`);
  };

  private _onClose = (): void => {
    console.log(`${this.errPrefix} Db client close`);
  };

  private _onConnected = (): void => {
    console.log(`${this.errPrefix} Db client connected`);
  };
}
