/* eslint-disable object-curly-newline */
/* eslint-disable no-return-assign */
import qs from 'qs';
import axios, { AxiosRequestConfig, AxiosResponse, isAxiosError, AxiosError } from 'axios';
import { CustomResult } from './custom-result';
import { CustomHttpOption } from './custom-http-option';

export class CustomHttpClient {
  private readonly _errPrefix = '[CustomHttpClient]';

  private readonly _errCalled = 499;

  /** Send request with content-type: application/json */
  public async tryPostJson<R = any>(opt: CustomHttpOption): Promise<CustomResult<R> | R> {
    const conf: AxiosRequestConfig = {
      url: opt.url,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: opt.timeout,
      responseType: 'json',
      data: {},
    };
    if (opt.isNotEmptyHeaders()) {
      opt.headers.forEach((v, k) => (conf.headers!![k] = v));
    }
    if (opt.isNotEmptyParameters()) {
      opt.parameters.forEach((v, k) => (conf.data!![k] = v));
    }

    let res: AxiosResponse;
    try {
      res = await axios(conf);
      if (opt.isUseCustomResult()) {
        return new CustomResult<R>().withResult(res.data);
      }
      return res.data;
    } catch (ex: any) {
      if (isAxiosError(ex)) {
        const err = <AxiosError>ex;
        if (err.response && err.response.data) {
          console.error(`${this._errPrefix} status: ${err.status}, data: ${JSON.stringify(err.response.data)}`);
          return new CustomResult().withCode(err.response.status).withMessage(`${this._errPrefix} ${conf.method} ${conf.url} fail: ${err.message}`).withResult(err.response.data);
        }
      }
      console.error(`${this._errPrefix} ${ex.stack}`);
      return new CustomResult().withCode(this._errCalled).withMessage(`${this._errPrefix} ${conf.method} ${conf.url} fail: ${ex.message}`).withResult(conf);
    }
  }

  public async tryPatchJson<R = any>(opt: CustomHttpOption): Promise<CustomResult<R> | R> {
    const conf: AxiosRequestConfig = {
      url: opt.url,
      method: 'patch',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: opt.timeout,
      responseType: 'json',
      data: {},
    };
    if (opt.isNotEmptyHeaders()) {
      opt.headers.forEach((v, k) => (conf.headers!![k] = v));
    }
    if (opt.isNotEmptyParameters()) {
      opt.parameters.forEach((v, k) => (conf.data!![k] = v));
    }

    let res: AxiosResponse;
    try {
      res = await axios(conf);
      if (opt.isUseCustomResult()) {
        return new CustomResult<R>().withResult(res.data);
      }
      return res.data;
    } catch (ex: any) {
      if (isAxiosError(ex)) {
        const err = <AxiosError>ex;
        if (err.response && err.response.data) {
          console.error(`${this._errPrefix} status: ${err.status}, data: ${JSON.stringify(err.response.data)}`);
          return new CustomResult().withCode(err.response.status).withMessage(`${this._errPrefix} ${conf.method} ${conf.url} fail: ${err.message}`).withResult(err.response.data);
        }
      }
      console.error(`${this._errPrefix} ${ex.stack}`);
      return new CustomResult().withCode(this._errCalled).withMessage(`${this._errPrefix} ${conf.method} ${conf.url} fail: ${ex.message}`).withResult(conf);
    }
  }

  /** Send request with content-type: application/x-www-form-urlencoded */
  public async tryPostUrlEncode<R = any>(opt: CustomHttpOption): Promise<CustomResult<R> | R> {
    const conf: AxiosRequestConfig = {
      url: opt.url,
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: opt.timeout,
      responseType: 'json',
      data: {},
    };
    if (opt.isNotEmptyHeaders()) {
      opt.headers.forEach((v, k) => (conf.headers!![k] = v));
    }
    if (opt.isNotEmptyParameters()) {
      opt.parameters.forEach((v, k) => (conf.data!![k] = v));
    }

    let res: AxiosResponse;
    try {
      conf.data = qs.stringify(conf.data);
      res = await axios(conf);
      if (opt.isUseCustomResult()) {
        return new CustomResult<R>().withResult(res.data);
      }
      return res.data;
    } catch (ex: any) {
      if (isAxiosError(ex)) {
        const err = <AxiosError>ex;
        if (err.response && err.response.data) {
          console.error(`${this._errPrefix} status: ${err.status}, data: ${JSON.stringify(err.response.data)}`);
          return new CustomResult().withCode(err.response.status).withMessage(`${this._errPrefix} ${conf.method} ${conf.url} fail: ${err.message}`).withResult(err.response.data);
        }
      }
      console.error(`${this._errPrefix} ${ex.stack}`);
      return new CustomResult().withCode(this._errCalled).withMessage(`${this._errPrefix} ${conf.method} ${conf.url} fail: ${ex.message}`).withResult(conf);
    }
  }

  public async tryGetJson<R = any>(opt: CustomHttpOption): Promise<CustomResult<R> | R> {
    const conf: AxiosRequestConfig = {
      url: opt.url,
      method: 'get',
      headers: {},
      timeout: opt.timeout,
      responseType: 'json',
    };
    if (opt.isNotEmptyHeaders()) {
      opt.headers.forEach((v, k) => (conf.headers!![k] = v));
    }
    if (opt.isNotEmptyParameters()) {
      const data: Record<string, any> = {};
      opt.parameters.forEach((v, k) => (data[k] = v));
      conf.url = `${opt.url}?${qs.stringify(data)}`;
    }

    let res: AxiosResponse;
    try {
      res = await axios(conf);
      if (opt.isUseCustomResult()) {
        return new CustomResult<R>().withResult(res.data);
      }
      return res.data;
    } catch (ex: any) {
      if (isAxiosError(ex)) {
        const err = <AxiosError>ex;
        if (err.response && err.response.data) {
          console.error(`${this._errPrefix} status: ${err.status}, data: ${JSON.stringify(err.response.data)}`);
          return new CustomResult().withCode(err.response.status).withMessage(`${this._errPrefix} ${conf.method} ${conf.url} fail: ${err.message}`).withResult(err.response.data);
        }
      }
      console.error(`${this._errPrefix} ${ex.stack}`);
      return new CustomResult().withCode(this._errCalled).withMessage(`${this._errPrefix} ${conf.method} ${conf.url} fail: ${ex.message}`).withResult(conf);
    }
  }
}
