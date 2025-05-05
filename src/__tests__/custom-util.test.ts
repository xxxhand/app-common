import * as path from 'path';
import * as fs from 'fs-extra';
import { ObjectId } from 'mongodb';
import { CustomUtils } from '../custom-utils';

describe('Custom utils test', () => {
  const jwtRegex = /^[a-zA-Z0-9-_=]+\.[a-zA-Z0-9-_=]+\.[a-zA-Z0-9-_.+/=]+$/;
  const myPrivateKeyFile = path.resolve(process.cwd(), 'src/__tests__/my_private_key.pem');
  const myPublicKeyFile = path.resolve(process.cwd(), 'src/__tests__/my_public_key.pem');
  const myPassphase = '1234';
  const encoging = 'utf-8';

  test('[fromStringToBase64] Convert string to base64 success', () => {
    const inputString = 'I am test';
    const base64 = 'SSBhbSB0ZXN0';
    const res = CustomUtils.fromStringToBase64(inputString);
    expect(res).toBe(base64);
  });
  test('[fromBase64ToString] Convert base64 to string success', () => {
    const inputString = 'I am test';
    const base64 = 'SSBhbSB0ZXN0';
    const res = CustomUtils.fromBase64ToString(base64);
    expect(res).toBe(inputString);
  });
  test('[clone] Clone object success', () => {
    const a = {
      name: 'I am Hand',
      age: 30,
      kids: ['Elva', 'Phoebe']
    };
    const b = CustomUtils.clone(a);
    expect(b).toEqual(a);
  });
  test('[makeRandomString] Make random string w/ specific length', () => {
    const res = CustomUtils.makeRandomString(10);
    expect(res).toHaveLength(10);
  });
  test('[makeRandomNumbers] Make random numbers w/ specific length', () => {
    const res = CustomUtils.makeRandomNumbers(4);
    expect(/\d/.test(res)).toBe(true)
    expect(res).toHaveLength(4);
  });
  test('[makeJsonWebToken] Should success while generate json web token w/ private key', async () => {
    const pKeyStr = await fs.readFile(myPrivateKeyFile, { encoding: encoging });
    const payload = {
      userId: 'xxxhand',
      roles: ['main', 'admin']
    };
    const myKey = await CustomUtils.makeJsonWebToken(payload, { key: pKeyStr, passphrase: myPassphase });
    expect(jwtRegex.test(myKey)).toBe(true);
  })
  test('[verifyJsonWebToken] Should success while parse json web token w/ public key', async () => {
    const pKeyStr = await fs.readFile(myPrivateKeyFile, { encoding: encoging });
    interface IMyPayload {
      name: string;
      role: string[];
    }
    const myPayload: IMyPayload = {
      name: 'imary',
      role: ['admin', 'hr']
    }
    const myKey = await CustomUtils.makeJsonWebToken(myPayload, { key: pKeyStr, passphrase: myPassphase });

    const pubKey = await fs.readFile(myPublicKeyFile, { encoding: encoging });
    const extractedPayload = await CustomUtils.verifyJsonWebToken<IMyPayload>(myKey, pubKey);
    expect(extractedPayload.name).toBe('imary');
    expect(extractedPayload.role).toBeInstanceOf(Array);
    const [admin, hr] = extractedPayload.role;
    expect(admin).toBe('admin');
    expect(hr).toBe('hr');
  })
  test('[makeJsonWebToken] Should fail while generate json web token w/ wrong private key', async () => {
    const pKeyStr = await fs.readFile(myPrivateKeyFile, { encoding: encoging });
    const payload = {
      userId: 'xxxhand',
      roles: ['main', 'admin']
    };
    try {
      await CustomUtils.makeJsonWebToken(payload, { key: pKeyStr, passphrase: 'aabc' });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  })
  test('[verifyJsonWebToken] Should fail while parsed json web token expired', async () => {
    const pKeyStr = await fs.readFile(myPrivateKeyFile, { encoding: encoging });
    const payload = {
      userId: 'xxxhand',
      roles: ['main', 'admin']
    };
    const pKey = await CustomUtils.makeJsonWebToken(payload, { key: pKeyStr, passphrase: myPassphase }, -3600);
    try {
      const pubKey = await fs.readFile(myPublicKeyFile, { encoding: encoging });
      await CustomUtils.verifyJsonWebToken(pKey, pubKey);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toEqual(expect.objectContaining({
        name: expect.any(String),
        message: 'jwt expired',
        expiredAt: expect.any(Date)
      }));
    }
  })
  test('[stringToObjectId] Should return an Object id instance', () => {
    const str = '6604e1e330cdfd694404a702';
    const id = CustomUtils.stringToObjectId(str);
    expect(id).toBeInstanceOf(ObjectId);
  });
  test('[getLangOrDefault]Should return default lang', () => {
    let lang: any = undefined;
    expect(CustomUtils.getLangOrDefault(lang)).toBe('dev');
    lang = null;
    expect(CustomUtils.getLangOrDefault(lang)).toBe('dev');
    lang = '';
    expect(CustomUtils.getLangOrDefault(lang)).toBe('dev');
    lang = '*';
    expect(CustomUtils.getLangOrDefault(lang)).toBe('dev');

  });
  test('[getLangOrDefault] Should return lang: zh-tw', () => {
    let lang: any = 'zh-TW,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6,ja;q=0.5,zh-CN;q=0.4,zh-HK;q=0.3';
    expect(CustomUtils.getLangOrDefault(lang)).toBe('zh-TW');
    lang = 'zh-TW';
    expect(CustomUtils.getLangOrDefault(lang)).toBe('zh-TW');
    lang = 'zh-TW,*';
    expect(CustomUtils.getLangOrDefault(lang)).toBe('zh-TW');
    lang = '*,zh-TW';
    expect(CustomUtils.getLangOrDefault(lang)).toBe('zh-TW');
    lang = 'zh,en,ja';
    expect(CustomUtils.getLangOrDefault(lang)).toBe('zh');
  });
  test('將陣列切割成指定大小的子陣列', () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = CustomUtils.splitArray(array, 3);
    
    expect(result).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [10]
    ]);
  });

  // 測試當 maxChunkSize 剛好整除陣列長度的情況
  test('當 maxChunkSize 剛好整除陣列長度時', () => {
    const array = [1, 2, 3, 4, 5, 6];
    const result = CustomUtils.splitArray(array, 2);
    
    expect(result).toEqual([
      [1, 2],
      [3, 4],
      [5, 6]
    ]);
  });

  // 測試空陣列
  test('空陣列應該回傳空的二維陣列', () => {
    const array: number[] = [];
    const result = CustomUtils.splitArray(array, 3);
    
    expect(result).toEqual([]);
  });

  // 測試 maxChunkSize 大於陣列長度的情況
  test('當 maxChunkSize 大於陣列長度時應該回傳單一子陣列', () => {
    const array = [1, 2, 3];
    const result = CustomUtils.splitArray(array, 5);
    
    expect(result).toEqual([[1, 2, 3]]);
  });

  // 測試 maxChunkSize 等於陣列長度的情況
  test('當 maxChunkSize 等於陣列長度時應該回傳單一子陣列', () => {
    const array = [1, 2, 3, 4];
    const result = CustomUtils.splitArray(array, 4);
    
    expect(result).toEqual([[1, 2, 3, 4]]);
  });

  // 測試泛型類型
  test('應該能夠處理不同類型的陣列', () => {
    // 字串陣列
    const stringArray = ['a', 'b', 'c', 'd', 'e'];
    const stringResult = CustomUtils.splitArray(stringArray, 2);
    expect(stringResult).toEqual([['a', 'b'], ['c', 'd'], ['e']]);
    
    // 物件陣列
    const objectArray = [
      { id: 1, name: '張三' },
      { id: 2, name: '李四' },
      { id: 3, name: '王五' },
      { id: 4, name: '趙六' }
    ];
    const objectResult = CustomUtils.splitArray(objectArray, 2);
    expect(objectResult).toEqual([
      [{ id: 1, name: '張三' }, { id: 2, name: '李四' }],
      [{ id: 3, name: '王五' }, { id: 4, name: '趙六' }]
    ]);
    
    // 混合類型陣列
    const mixedArray: (number | string)[] = [1, 'a', 2, 'b', 3];
    const mixedResult = CustomUtils.splitArray(mixedArray, 2);
    expect(mixedResult).toEqual([[1, 'a'], [2, 'b'], [3]]);
  });

  // 測試非法參數
  test('非法的 maxChunkSize 參數應該拋出錯誤', () => {
    const array = [1, 2, 3];
    
    // 測試非正整數
    expect(() => CustomUtils.splitArray(array, 0)).toThrow('Chunk size must be greater than 0');
    expect(() => CustomUtils.splitArray(array, -1)).toThrow('Chunk size must be greater than 0');
    
    // 測試非整數
    expect(() => CustomUtils.splitArray(array, 2.5)).toThrow('Chunk size must be greater than 0');
  });
  
  // 測試非陣列輸入
  test('非陣列輸入應該拋出錯誤', () => {
    // @ts-ignore 下面這行在 TypeScript 中會報錯，但我們要測試運行時的情況
    expect(() => CustomUtils.splitArray('not an array', 2)).toThrow('Input must be an array');
  });
});