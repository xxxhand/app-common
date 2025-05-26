/* eslint-disable no-console */
import { MongoClient, MongoClientOptions, Db, Collection } from 'mongodb';
import { IMongoOptions } from './custom-definition';

export class CustomMongoClient {
  /** Connect uri string */
  private _uri: string;

  /** mongo client instance */
  private _instance: MongoClient;

  /** true if connect to database done */
  private _isConnected: boolean = false;

  /** retry connecting times */
  private _numberOfRetries: number = 1;

  /** database name */
  private _dbName: string = '';

  /** database instance */
  private _db?: Db = undefined;

  private _defaultOptions: MongoClientOptions = {
    minPoolSize: 1,
    maxPoolSize: 10,
    connectTimeoutMS: 30 * 1000,
  };

  private readonly _error_prefix = '[custom-mongo-client]';

  constructor(uri: string, options: IMongoOptions) {
    if (!uri || uri.length === 0) {
      throw new Error(`${this._error_prefix} uri is empty`);
    }
    this._uri = uri;
    if (!options.db || options.db.length === 0) {
      throw new Error(`${this._error_prefix} db name is empty`);
    }
    this._dbName = options.db;

    this._defaultOptions.minPoolSize = options.minPoolSize;
    this._defaultOptions.maxPoolSize = options.maxPoolSize;
    this._defaultOptions.connectTimeoutMS = options.connectTimeoutMS;
    if (options.user && options.user.length > 0) {
      this._defaultOptions.auth = {
        username: options.user,
        password: options.pass,
      };
    }
    this._instance = new MongoClient(this._uri, this._defaultOptions);
  }

  public get client(): MongoClient {
    return this._instance;
  }

  public async tryConnect(): Promise<void> {
    console.log(`Try connecting for ${this._numberOfRetries} times`);
    await this._instance.connect();
    this._instance.on('error', this._onError);
    this._instance.on('connectionClosed', this._onClose);
    await new Promise<void>((res) => {
      this._instance.once('serverHeartbeatStarted', () => {
        this._db = this._instance.db(this._dbName);
        this._isConnected = true;
        this._numberOfRetries = 1;
        console.log(`${this._dbName} opened...`);
        res();
      });
    });
  }

  public async close(): Promise<void> {
    console.log(`${this._error_prefix} Database closing...`);
    this._onClose();
  }

  public isConnected(): boolean {
    return this._isConnected;
  }

  public getCollection(col: string): Collection {
    if (!this._db) {
      throw new Error(`${this._error_prefix} DB is undefinded`);
    }
    return this._db.collection(col);
  }

  /** Try to connect to db before get collection, if client already disconnected */
  public async getCollectionAsync(col: string): Promise<Collection> {
    if (!(this._db && this.isConnected())) {
      await this.tryConnect();
    }
    return this.getCollection(col);
  }

  private _onError = (err: Error): void => {
    console.log(`${this._error_prefix} Database ${this._dbName} error: ${err}`);
    this._onClose();
    this.tryConnect();
  };

  private _onClose = (): void => {
    console.log(`${this._error_prefix} Database ${this._dbName} close...`);
    this._isConnected = false;
    this._db = undefined;
    this._instance.removeAllListeners();
    this._numberOfRetries = 0;
  };
}
