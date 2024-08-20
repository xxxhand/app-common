import * as uuid from 'uuid';
import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import {
  BASIC_CHARS, COMPLEX_CHARS, SALT_ROUNDS, NUMS, IPrivateKeyStruct,
  DEFAULT_CRYPTO_ALG, DEFAULT_ENCODING, DEFAULT_EXPIRES_IN_SECONDS,
  DEFAULT_LANG
} from './custom-definition';

export class CustomUtils {
  private static readonly _BASE64 = 'base64';

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
    return Buffer.from(base64Str, this._BASE64).toString(DEFAULT_ENCODING);
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

  /**
   * Make one json web token with private key and passphase
   * @param payload
   * @param key
   * @param expiresInSeconds default value is one hour
   * @returns {Promise<string>}
   */
  // eslint-disable-next-line max-len
  public static async makeJsonWebToken(payload: string | object, key: IPrivateKeyStruct, expiresInSeconds: number = DEFAULT_EXPIRES_IN_SECONDS): Promise<string> {
    return new Promise((res, rej) => {
      // eslint-disable-next-line max-len
      jwt.sign(payload, key, { algorithm: DEFAULT_CRYPTO_ALG, expiresIn: expiresInSeconds }, (err, keyStr) => {
        if (err) {
          return rej(err);
        }
        return res(<string>keyStr);
      });
    });
  }

  // eslint-disable-next-line max-len
  public static async verifyJsonWebToken<MyPayload = any>(token: string, key: string): Promise<MyPayload> {
    return new Promise((res, rej) => {
      jwt.verify(token, key, (err, obj) => {
        if (err) {
          return rej(err);
        }
        return res(<MyPayload>obj);
      });
    });
  }

  /** Make UUID */
  public static makeUUID(): string {
    return uuid.v4();
  }

  /** Convert string to Object id of mongodb */
  public static stringToObjectId = (str: string): ObjectId => new ObjectId(str);

  /** Get lang from accept-language, it would return `dev` if the defaultLang is empty */
  public static getLangOrDefault(inputLangs?: string, defaultLang: string = DEFAULT_LANG): string {
    if (!(inputLangs && (typeof inputLangs === 'string') && inputLangs.length > 0)) {
      return defaultLang;
    }
    return inputLangs
      .split(',')
      .map(lang => {
        const [locale, qValue] = lang.trim().split(';q=');
        return { locale: locale.trim(), q: parseFloat(qValue) || (locale === '*' ? 0 : 1.0) };
      })
      .sort((a, b) => b.q - a.q)[0].locale === '*' ? defaultLang : inputLangs.split(',')
        .map(lang => {
          const [locale, qValue] = lang.trim().split(';q=');
          return { locale: locale.trim(), q: parseFloat(qValue) || (locale === '*' ? 0 : 1.0) };
        })
        .sort((a, b) => b.q - a.q)[0].locale;
  }

  private static _generateRandomValues(len: number, chars: string): string {
    const buf: string[] = [];
    for (let i = 0; i < len; i += 1) {
      buf.push(chars[Math.floor(Math.random() * chars.length)]);
    }
    return buf.join('');
  }
}
