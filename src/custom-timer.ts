import { CustomResult } from './custom-result';
import { TIMEOUT_ERROR_CODE, TIMEOUT_ERROR_MSG } from './custom-definition';

export class CustomTimer<T = any> {
  // eslint-disable-next-line no-undef
  private _timeoutId: NodeJS.Timeout | null = null;

  private _isTerminated = false;

  private _err_prefix = '[CustomTimer]';

  /** Try execute an async task until timeout */
  public async tryExecOrTimeout(asyncTask: Promise<T>, timeoutInSeconds: number): Promise<CustomResult<T>> {
    if (this._isTerminated) {
      throw new Error('The timer has been terminated. Please create a new instance.');
    }
    const res = new CustomResult<T>();
    this._isTerminated = false;

    // eslint-disable-next-line no-unused-vars
    const timeoutAsync = new Promise<CustomResult<T>>((resolve, _) => {
      this._timeoutId = setTimeout(() => {
        this._isTerminated = true;
        res.code = TIMEOUT_ERROR_CODE;
        res.message = TIMEOUT_ERROR_MSG;
        res.result = undefined;
        resolve(res);
      }, timeoutInSeconds * 1000);
    });
    try {
      const finalResult = await Promise.race<CustomResult<T> | T>([asyncTask, timeoutAsync]);
      res.result = finalResult as T;
      return res;
    } catch (ex) {
      if (ex instanceof Error) {
        console.error(`${this._err_prefix} ${ex.stack}`);
      } else {
        console.error(`${this._err_prefix} ${ex}`);
      }
      res.code = TIMEOUT_ERROR_CODE;
      res.message = TIMEOUT_ERROR_MSG;
      return res;
    } finally {
      this._cleanUp();
    }
  }

  /** Run again with same instance */
  public renew(): void {
    this._cleanUp();
    this._isTerminated = false;
  }

  /**
   * 檢查Promise是否已被中斷
   * @returns 返回是否已中斷
   */
  public isTerminated(): boolean {
    return this._isTerminated;
  }

  /** 清除逾時id */
  private _cleanUp() {
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
      this._timeoutId = null;
    }
    this._isTerminated = true;
  }
}
