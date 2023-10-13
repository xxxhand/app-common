
export class CustomResult<T = any> {
  /** For tracing */
  public traceId: string = '';
  /** Error code, 0 means success */
  public code: number = 0;
  /** Error message */
  public message: string = '';
  /** Return value */
  public result?: T = undefined;

  public isOK(): boolean {
  	return this.code === 0;
  }

  public withTraceId(traceId: string): CustomResult {
  	this.traceId = traceId;
  	return this;
  }

  public withCode(code: number): CustomResult {
  	this.code = code;
  	return this;
  }

  public withMessage(message: string): CustomResult {
  	this.message = message;
  	return this;
  }

  public withResult(result?: T) : CustomResult {
  	this.result = result;
  	return this;
  }
}
