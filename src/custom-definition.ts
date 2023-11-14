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

export type TNullable<T> = T | undefined | null;

export const OTHER_ERROR_CODE_NAME = 'ERR_OTHERS';
export const OTHER_ERROR_CODE = 99999;
export const OTHER_ERROR_MSG = 'Ops! Exception';
