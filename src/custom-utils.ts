import * as uuid from 'uuid';
import * as _ from 'lodash';
import {
  BASIC_CHARS, COMPLEX_CHARS, SALT_ROUNDS, NUMS,
} from './custom-definition';

export class CustomUtils {
  private static readonly _BASE64 = 'base64';

  private static readonly _UTF8 = 'utf-8';

  /** Pause process in seconds */
  public static async sleep(inSeconds: number): Promise<void> {
    return new Promise(((res) => {
      setTimeout(() => {
        res();
      }, inSeconds * 1000);
    }));
  }

  /** Convert string to base64 */
  public static fromStringToBase64(str: string): string {
    return Buffer.from(str).toString(this._BASE64);
  }

  /** Convert base64 string to string */
  public static fromBase64ToString(base64Str = ''): string {
    return Buffer.from(base64Str, this._BASE64).toString(this._UTF8);
  }

  /** Clone object */
  public static clone<T = any>(obj: T): T {
    return _.cloneDeep(obj) as T;
  }

  /** Make random numbers */
  public static makeRandomNumbers(len: number = SALT_ROUNDS): string {
    return this._generateRandomValues(len, NUMS);
  }

  /** Make random string */
  public static makeRandomString(len = SALT_ROUNDS): string {
    return this._generateRandomValues(len, BASIC_CHARS);
  }

  /** Make random string w/ symbols */
  public static makeComplexRandomString(len = SALT_ROUNDS): string {
    return this._generateRandomValues(len, COMPLEX_CHARS);
  }

  /** Make UUID */
  public static makeUUID(): string {
    return uuid.v4();
  }

  private static _generateRandomValues(len: number, chars: string): string {
    const buf: string[] = [];
    for (let i = 0; i < len; i += 1) {
      buf.push(chars[Math.floor(Math.random() * chars.length)]);
    }
    return buf.join('');
  }
}
