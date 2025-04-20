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
	IS_OBJECT_ID = 'isObjectId'
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

export const TIMEOUT_ERROR_CODE_NAME = 'ERR_TIMEOUT';
export const TIMEOUT_ERROR_CODE = 99998;
export const TIMEOUT_ERROR_MSG = 'Ops! Timeout';

export const BASIC_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const COMPLEX_CHARS = `${BASIC_CHARS}!@#$%&*.+-;`;
export const NUMS = '0123456789';
export const SALT_ROUNDS = 9;

/** For generate json web token */
export interface IPrivateKeyStruct {
	key: string,
	passphrase: string,
}

export const DEFAULT_ENCODING = 'utf-8';
export const DEFAULT_CRYPTO_ALG = 'RS256';
export const DEFAULT_REQUEST_TIMEOUT = 30;
// Default expires in one hour
export const DEFAULT_EXPIRES_IN_SECONDS = 60 * 60 * 1;
export const DEFAULT_FIREBASE_NAME = 'COMMON_FIREBASE';
// Default lang
export const DEFAULT_LANG = 'dev';

// For mongo database options
export interface IMongoOptions {
	minPoolSize: number;
	maxPoolSize: number;
	connectTimeoutMS: number;
	user?: string;
	pass?: string;
	db: string;
}

// For redis database options
export interface IRedisOptions {
	host: string;
	port: number;
	password: string;
	db: number;
}
