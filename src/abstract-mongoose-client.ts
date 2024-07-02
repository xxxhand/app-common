import mongoose, {
  Mongoose, ConnectOptions, Connection, Schema, Model, Document,
} from 'mongoose';
import { TNullable } from './custom-definition';

export abstract class TMongooseClient {
  /** Prefix for console log */
  protected errPrefix: string = '';

  /** Connection uri for mongodb */
  protected uri: string = '';

  /** Mongoose instance */
  protected instance: TNullable<Mongoose> = null;

  /** Connection instance */
  protected conn: TNullable<Connection> = null;

  /** Connection options */
  protected opt: ConnectOptions = {
    maxPoolSize: 10,
    connectTimeoutMS: 30 * 1000,
  };

  /** New mongoose instance */
  protected newInstance(): void {
    this.instance = new Mongoose();
  }

  /** The mongoose instance of this client */
  public get theInstance(): Mongoose {
    if (!this.instance) {
      throw new Error(`[${this.errPrefix}] Mongoose instance not init`);
    }
    return this.instance;
  }

  /** The connection instance of mongo db of this client */
  public get theConnection(): Connection {
    if (!this.conn) {
      throw new Error(`[${this.errPrefix}] Connection instance not init`);
    }
    return this.conn;
  }

  /** Try connect to mongo db */
  public async tryConnect(): Promise<void> {
    this.conn = mongoose.createConnection(this.uri, this.opt);
    this.conn.on('connected', this._onConnected);
    this.conn.on('error', this._onError);
    this.conn.on('close', this._onClose);
    this.conn.on('disconnected', this._onDisconnnect);

    return new Promise<void>((res) => {
      (this.conn as Connection).once('open', () => res());
    });
  }

  /** Register mongoose schema as a model */
  public registerAsModel(name: string, schema: Schema): void {
    if (!this.conn) {
      throw new Error(`[${this.errPrefix}] Connection instance not init`);
    }
    this.conn.model(name, schema);
  }

  /** Get a mongoose model */
  public getModel<T extends Document>(name: string): Model<T> {
    if (!this.conn) {
      throw new Error(`[${this.errPrefix}] Connection instance not init`);
    }
    const m = this.conn.models[name];
    if (!m) {
      throw new Error(`[${this.errPrefix}] Model ${name} is not defined`);
    }
    return m;
  }

  /** Terminate mongoose instance  */
  public async terminate(): Promise<void> {
    if (!this.conn) {
      return;
    }
    this.conn.removeAllListeners();
    await this.conn.close();
    this.conn = null;
    this.instance = null;
  }

  private _onError = (err: Error): void => {
    console.error(`${this.errPrefix} ${err}`);
  };

  private _onDisconnnect = (): void => {
    console.log(`${this.errPrefix} Db client disconnected`);
  };

  private _onClose = (): void => {
    console.log(`${this.errPrefix} Db client close`);
  };

  private _onConnected = (): void => {
    console.log(`${this.errPrefix} Db client connected`);
  };
}
