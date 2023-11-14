import { StatusCodes } from 'http-status-codes';
import { ICodeStruct } from '../custom-definition';
import { CustomError } from '../custom-error';

describe('Custom error test', () => {
  beforeEach(() => {
    CustomError.clearAllCodes();
  });
  it('Function isSuccess should returned true', () => {
    const codeName = 'SUCCESS';
    const code: ICodeStruct = {
      code: 0,
      codeName,
      message: '',
      httpStatus: StatusCodes.OK
    };
    CustomError.addCodes([code]);
    const err = new CustomError(codeName);
    expect(err.isSuccess()).toBe(true);
  });
  it('Function isException should returned true', () => {
    const err = new CustomError('I am not defined');
    expect(err.isException()).toBe(true);
    expect(err.code).toBe(99999);
    expect(err.codeName).toBe('ERR_OTHERS');
    expect(err.httpStatus).toBe(500);
  });
  it('Function getCodes should returned all defined code struct in array', () => {
    const codes: ICodeStruct[] = [
      {
        code: 0,
        codeName: 'SUCCESS',
        message: '',
        httpStatus: StatusCodes.OK,
      },
      {
        code: 10001,
        codeName: 'ERR_NAME_IS_EMPTY',
        message: 'Input name is empty',
        httpStatus: StatusCodes.BAD_REQUEST,
      },
    ];
    CustomError.addCodes(codes);
    const codeAry = CustomError.getCodes();
    expect(Array.isArray(codeAry)).toBe(true);
    expect(codeAry).toHaveLength(2);
  });
  it('Function getCode should returned specific defined code struct', () => {
    const codes: ICodeStruct[] = [
      {
        code: 0,
        codeName: 'SUCCESS',
        message: '',
        httpStatus: StatusCodes.OK,
      },
      {
        code: 10001,
        codeName: 'ERR_NAME_IS_EMPTY',
        message: 'Input name is empty',
        httpStatus: StatusCodes.BAD_REQUEST,
      },
    ];
    CustomError.addCodes(codes);
    const err = CustomError.getCode('ERR_NAME_IS_EMPTY');
    expect(err.code).toBe(10001);
    expect(err.message).toBe('Input name is empty');
    expect(err.httpStatus).toBe(400);

  });
  it('Function getCode should returned un-defined code struct', () => {
    const codes: ICodeStruct[] = [
      {
        code: 0,
        codeName: 'SUCCESS',
        message: '',
        httpStatus: StatusCodes.OK,
      },
      {
        code: 10001,
        codeName: 'ERR_NAME_IS_EMPTY',
        message: 'Input name is empty',
        httpStatus: StatusCodes.BAD_REQUEST,
      },
    ];
    CustomError.addCodes(codes);
    const err = CustomError.getCode('I am not defined');
    expect(err.code).toBe(99999);
    expect(err.codeName).toBe('ERR_OTHERS');
    expect(err.httpStatus).toBe(500);
  });
  it('Function from should returned customError instance', () => {
    const err = CustomError.from(new Error('I am error'));
    expect(err instanceof CustomError).toBe(true);
    expect(err.code).toBe(99999);
    expect(err.codeName).toBe('ERR_OTHERS');
    expect(err.httpStatus).toBe(500);
    expect(err.message).toBe('I am error');
  });
  it('Function addCodes should fail course of duplicate name', () => {
    const codes: ICodeStruct[] = [
      {
        code: 0,
        codeName: 'SUCCESS',
        message: '',
        httpStatus: StatusCodes.OK,
      },
      {
        code: 10001,
        codeName: 'ERR_NAME_IS_EMPTY',
        message: 'Input name is empty',
        httpStatus: StatusCodes.BAD_REQUEST,
      },
    ];
    CustomError.addCodes(codes);
    const newCodes: ICodeStruct[] = [
      {
        code: 0,
        codeName: 'SUCCESS',
        message: '',
        httpStatus: StatusCodes.OK,
      },
    ];
    expect(() => CustomError.addCodes(newCodes)).toThrowError('Duplicate code name SUCCESS was founded')
    expect(CustomError.getCodes()).toHaveLength(2);
  });
  it('Function format should place variables into string', () => {
    const rawMessage = 'This is %s test for formating %i';
    const msgArgs: Array<string | number> = ['xxxhand', 100];
    const err = new CustomError(rawMessage, msgArgs);
    err.format();
    expect(err.code).toBe(99999);
    expect(err.codeName).toBe('ERR_OTHERS');
    expect(err.httpStatus).toBe(500);
    expect(err.message).toBe('This is xxxhand test for formating 100');
  });
})