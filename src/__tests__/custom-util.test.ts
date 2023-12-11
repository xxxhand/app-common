import { CustomUtils } from '../custom-utils';

describe('Custom utils test', () => {
  test('Convert string to base64 success', () => {
    const inputString = 'I am test';
    const base64 = 'SSBhbSB0ZXN0';
    const res = CustomUtils.fromStringToBase64(inputString);
    expect(res).toBe(base64);
  });
  test('Convert base64 to string success', () => {
    const inputString = 'I am test';
    const base64 = 'SSBhbSB0ZXN0';
    const res = CustomUtils.fromBase64ToString(base64);
    expect(res).toBe(inputString)
  });
  test('Clone object success', () => {
    const a = {
      name: 'I am Hand',
      age: 30,
      kids: ['Elva', 'Phoebe']
    };
    const b = CustomUtils.clone(a);
    expect(b).toEqual(a);
  });
  test('Make random string w/ specific length', () => {
    const res = CustomUtils.makeRandomString(10);
    expect(res).toHaveLength(10);
  });
  test('Make random numbers w/ specific length', () => {
    const res = CustomUtils.makeRandomNumbers(4);
    expect(/\d/.test(res)).toBe(true)
    expect(res).toHaveLength(4);
  });
});