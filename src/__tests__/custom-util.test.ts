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
});