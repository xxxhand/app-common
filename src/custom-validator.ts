import * as _ from 'lodash';
import { CustomError } from './custom-error';
import { validateStrategy, validateFunc, IValidateRule } from './custom-definition';

const _nonEmptyString: validateFunc = (val: string): boolean => {
  if (!val || typeof val !== 'string') {
    return false;
  }
  return val.trim().length > 0;
};

const _nonEmptyArray: validateFunc = (val: Array<any>): boolean => val
		&& Array.isArray(val)
		&& val.length > 0;

const _isNumber: validateFunc = (val: any): boolean => typeof val === 'number';

const _isEmail:validateFunc = (val: any): boolean => /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(val);

export class CustomValidator {
  private static readonly _funcs = new Map<string, validateFunc>()
    .set(validateStrategy.NON_EMPTY_STRING, _nonEmptyString)
    .set(validateStrategy.NON_EMPTY_ARRAY, _nonEmptyArray)
    .set(validateStrategy.IS_EMAIL, _isEmail)
    .set(validateStrategy.IS_NUMBER, _isNumber);

  /** Validate input value w/ throw error */
  public checkThrows(val: any, ...rules: IValidateRule[]): CustomValidator {
    for (const rule of rules) {
      if (rule.fn && typeof rule.fn === 'function') {
        const result = rule.fn(val);
        if (!result) {
          throw new CustomError(rule.m);
        }
        // eslint-disable-next-line no-continue
        continue;
      }
      if (rule.s) {
        const s = CustomValidator._funcs.get(rule.s);
        if (!s) {
          throw new CustomError('', [`${rule.s} checker is not defined`]);
        }
        const result = s(val);
        if (!result) {
          throw new CustomError(rule.m);
        }
        // eslint-disable-next-line no-continue
        continue;
      }
      throw new CustomError('Either one of s or fn must be defined');
    }
    return this;
  }

  /** Check input string is empty or not, throws error if needed  */
  public nonEmptyStringThrows(val: string, message?: string): CustomValidator {
    if (!_nonEmptyString(val)) {
      throw new CustomError(message || 'Empty string');
    }
    return this;
  }

  /** Check input is  number or not, throws error if needed  */
  public isNumberThrows(val: number, message?: string): this {
    if (!_isNumber(val)) {
      throw new CustomError(message || 'Not a number');
    }
    return this;
  }

  /** Check input string is empty or not, throws error if needed  */
  public static nonEmptyString(val?: string, message?: string): boolean {
    const res = _nonEmptyString(val);
    if (!res && _nonEmptyString(message)) {
      throw new CustomError(message || 'Empty string');
    }
    return res;
  }

  public static nonEmptyArray(val: Array<any>, message?: string): boolean {
    const res = _nonEmptyArray(val);
    if (!res && _nonEmptyString(message)) {
      throw new CustomError(message || 'Empty array');
    }
    return res;
  }

  public static isNumber(val: number, message?: string): boolean {
    const res = _isNumber(val);
    if (!res && _nonEmptyString(message)) {
      throw new CustomError(message || 'Not a number');
    }
    return res;
  }

  public static isEqual(val1: any, val2: any, message?: string): boolean {
    const res = _.isEqual(val1, val2);
    if (!res && _nonEmptyString(message)) {
      throw new CustomError(message || 'Not match');
    }
    return res;
  }
}
