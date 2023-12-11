/* eslint-disable no-unused-vars, no-shadow */
/** For custom error usage */
export interface ICodeStruct {
	/** Code name */
  codeName: string;
	/** Code */
	code: number;
	/** Status code of http */
	httpStatus: number;
	/** Message */
	message: string;
}
/** For custom error usage */

/** For custom validator usage */
export enum validateStrategy {
	NON_EMPTY_STRING = 'isNonEmptyString',
	NON_EMPTY_ARRAY = 'isNonEmptyArray',
	IS_EMAIL = 'isEmail',
	IS_NUMBER = 'isNumber',
}
export type validateFunc = (val: any) => boolean;
export interface IValidateRule {
	s?: validateStrategy;
	m: string;
	fn?: validateFunc;
}
/** For custom validator usage */

export type TNullable<T> = T | undefined | null;

export const OTHER_ERROR_CODE_NAME = 'ERR_OTHERS';
export const OTHER_ERROR_CODE = 99999;
export const OTHER_ERROR_MSG = 'Ops! Exception';

export const BASIC_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const COMPLEX_CHARS = `${BASIC_CHARS}!@#$%&*.+-;`;
export const NUMS = '0123456789';
export const SALT_ROUNDS = 9;
