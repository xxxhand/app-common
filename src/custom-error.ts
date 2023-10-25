import * as util from 'util';
import { StatusCodes } from 'http-status-codes';
import {
  ICodeStruct,
  OTHER_ERROR_CODE,
  OTHER_ERROR_CODE_NAME,
  OTHER_ERROR_MSG,
} from './custom-types';

export class CustomError extends Error {
  private _code: number = OTHER_ERROR_CODE;

  private _message: string = '';

  private _codeName: string = '';

  private _httpStatus: number = StatusCodes.INTERNAL_SERVER_ERROR;

  private _msgArgs: Array<string | number> = [];

  private static readonly _errorCodes: Map<string, ICodeStruct> = new Map();

  constructor(codeName: string, msgArgs?: Array<string | number>) {
    super();
    const e = CustomError.getCode(codeName);
    this._code = e.code;
    this._message = e.message;
    this._httpStatus = e.httpStatus;
    this._codeName = e.codeName;
    this._msgArgs = msgArgs || [];
  }

  /**
   * Getter code
   */
  public get code(): number {
    return this._code;
  }

  /**
   * Setter message
   */
  public set message(value: string) {
    this._message = value;
  }

  /**
   * Getter message
   */
  public get message(): string {
    return this._message;
  }

  /**
   * Getter name
   */
  public get codeName(): string {
    return this._codeName;
  }

  /**
   * Getter httpStatus
   */
  public get httpStatus(): number {
    return this._httpStatus;
  }

  /**
   * Getter msgArgs
   */
  public get msgArgs(): Array<string | number> {
    return this._msgArgs;
  }

  /**
   * Setter msgArgs
   */
  public set msgArgs(value: Array<string | number>) {
    this._msgArgs = value;
  }

  /**
   * To check current instance is success or not
   */
  public isSuccess(): boolean {
    return this._code === 0;
  }

  /** To check current instance is exception or not */
  public isException(): boolean {
    return this._code === OTHER_ERROR_CODE;
  }

  /** To place msg args to message */
  public format(): void {
    if (this._msgArgs.length > 0) {
      this._message = util.format(this.message, ...this.msgArgs);
    }
  }

  /**
   * Get all defined error codes in array
   */
  public static getCodes(): Array<ICodeStruct> {
    /* eslint-disable no-unused-vars */
    return Array.from(CustomError._errorCodes, ([_, value]) => value);
  }

  /**
   * Get single error code by name
   * @param codeName The code name
   */
  public static getCode(codeName: string): ICodeStruct {
    let err = CustomError._errorCodes.get(codeName);
    if (!err) {
      err = {
        codeName: OTHER_ERROR_CODE_NAME,
        code: OTHER_ERROR_CODE,
        message: codeName || OTHER_ERROR_MSG,
        httpStatus: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
    return err;
  }

  /**
   * Add error codes
   * @param codes The defined error codes to be added
   */
  public static addCodes(codes: Array<ICodeStruct>): void {
    if (!Array.isArray(codes) || codes.length === 0) {
      throw new Error('Cannot added with an empty array');
    }
    codes.forEach((code) => {
      if (CustomError._errorCodes.has(code.codeName)) {
        throw new Error(`Duplicate code name ${code.codeName} was founded`);
      }
      CustomError._errorCodes.set(code.codeName, code);
    });
  }

  public static from(error: unknown): CustomError {
    if (error instanceof CustomError) {
      return error;
    }
    const err = new CustomError('');
    if (error instanceof Error) {
      err.message = error.message;
    }
    return err;
  }

  /**
   * Clear all added error codes
   */
  public static clearAllCodes(): void {
    CustomError._errorCodes.clear();
  }
}
