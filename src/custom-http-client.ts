import qs from 'qs';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
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
      console.error(`${this._errPrefix} ${ex}`);
      return new CustomResult().withCode(this._errCalled).withMessage(`${this._errPrefix} ${conf.method} ${conf.url} fail: ${ex}`).withResult(conf);
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
      console.error(`${this._errPrefix} ${ex}`);
      return new CustomResult().withCode(this._errCalled).withMessage(`${this._errPrefix} ${conf.method} ${conf.url} fail: ${ex}`).withResult(conf);
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
      console.error(`${this._errPrefix} ${ex}`);
      return new CustomResult().withCode(this._errCalled).withMessage(`${this._errPrefix} ${conf.method} ${conf.url} fail: ${ex}`).withResult(conf);
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
      console.error(`${this._errPrefix} ${ex}`);
      return new CustomResult().withCode(this._errCalled).withMessage(`${this._errPrefix} ${conf.method} ${conf.url} fail: ${ex}`).withResult(conf);
    }
  }
}
