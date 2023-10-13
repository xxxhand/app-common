import { CustomResult } from '../custom-result';

describe('Custom result model test', () => {
  it('Call isOk method should return true', () => {
    const res = new CustomResult<string>();
    expect(res.isOK()).toBe(true);
  });
  it('Result should be "I am result"', () => {
    const res = new CustomResult<string>()
      .withResult('I am result');

    expect(res.result).toBe('I am result');
  });
});
