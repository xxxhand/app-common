import { IMongoOptions } from '../custom-definition';
import { CustomMongoClient } from '../custom-mongo-client';

describe.skip('Mongo client test', () => {
  test('Should connect and query success', async () => {
    const opt: IMongoOptions = {
      minPoolSize: 1,
      maxPoolSize: 10,
      connectTimeoutMS: 30 * 1000,
      db: 'hand_test',
      directConnect: true,
    };
    const uri = `mongodb://localhost:27017/${opt.db}`;
    const colName = 'handTest';
    const client = new CustomMongoClient(uri, opt);
    await client.tryConnect();
    const col = client.getCollection(colName);
    await col.insertOne({ hand: 'test', val: 'xxx' });
    const doc = await col.findOne({ hand: 'test' });
    expect(doc).toBeTruthy();
    expect(doc?.val).toBe('xxx');
    await client.close();
  })
})
