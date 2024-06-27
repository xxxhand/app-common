import { Readable } from 'node:stream';
import { DEFAULT_REQUEST_TIMEOUT } from './custom-definition';

export class CustomHttpOption {
  /** Target request url */
  private _url: string = '';
  /** Request headers */
  private _headers: Map<string, string> = new Map();
  /** For adding parameters in body, query string, form...etc */
  private _parameters: Map<string, any> = new Map();
  /** For upload attachments */
  private _attachments: Map<string, Readable> = new Map();
  /** Return with custom result after request, default to true */
  private _useCustomResult: boolean = true;
  /**  Request timeout in seconds, default to 30s */
  private _timeout: number =  DEFAULT_REQUEST_TIMEOUT * 1000;

  /** Get url */
  public get url(): string { 
    return this._url;
  }

  /** Get headers */
  public get headers(): Map<string, string> {
    return this._headers;
  }

  /** Get parameters */
  public get parameters(): Map<string, any> {
    return this._parameters;
  }

  /** Get attachments */
  public get attachments(): Map<string, Readable> {
    return this._attachments;
  }

  /** Get timeout */
  public get timeout(): number {
    return this._timeout;
  }

  /** Set target url */
  public targetUrl(url: string): CustomHttpOption {
    this._url = url;
    return this;
  }

  /** Set header parameter */
  public addHeader(key: string, val: string): CustomHttpOption {
    this._headers.set(key, val);
    return this;
  }

  /** Set all parameters */
  public addParameter(key: string, val: any): CustomHttpOption {
    this._parameters.set(key, val);
    return this;
  }

  /** Set attachment with readble stream */
  public addAttachment(key: string, val: Readable): CustomHttpOption {
    this._attachments.set(key, val);
    return this;
  }

  /** Do not use CustomResult for returning */
  public nonUseCustomResult(): CustomHttpOption {
    this._useCustomResult = false;
    return this;
  }

  /** Set request timeout in seconds */
  public useTimeoutInSeconds(time: number): CustomHttpOption {
    this._timeout = time * 1000;
    return this;
  }

  /** Clear headers, url, parameters and attachemnts */
  public clear(): void {
    this._url = '';
    this._headers.clear();
    this._parameters.clear();
    this._attachments.clear();
  }

  /** Check header is not empty */
  public isNotEmptyHeaders(): boolean {
    return this._headers.size > 0;
  }

  /** Check parameters is not empty */
  public isNotEmptyParameters(): boolean {
    return this._parameters.size > 0;
  }

  /** Check attachments is not empty */
  public isNotEmptyAttachments(): boolean {
    return this._attachments.size > 0;
  }

  /** Check for returning result using format */
  public isUseCustomResult(): boolean {
    return this._useCustomResult;
  }
}
