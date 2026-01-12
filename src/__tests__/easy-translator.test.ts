import { TEasyTranslator } from '../abstract-easy-translator';

describe('Easy translator test', () => {
  let trs: TEasyTranslator;
  beforeAll(async () => {
    class MyTranslator extends TEasyTranslator { }
    trs = await new MyTranslator()
      .useDictionary('dev', { 'HELLO': 'World' })
      .useDictionary('en', { 'HELLO': 'World!!' })
      .useDictionary('zh-tw', { 'HELLO': '你好' })
      .useFallbackLng('dev')
      .initial();
  })
  test('Should translate to en', () => {
    expect(trs.t('HELLO', 'en')).toBe('World!!');
  });
  test('Should translate to zh-tw', () => {
    expect(trs.t('HELLO', 'zh-TW')).toBe('你好');
  });
  test('Should translate to fallback lang', () => {
    expect(trs.t('HELLO')).toBe('World');
  });
  test('Not found key, should be input key', () => {
    expect(trs.t('HELLOLO')).toBe('HELLOLO');
  });
  test('Not found fallback language, should be input key', () => {
    trs.useFallbackLng('nofallback')
    expect(trs.t('HELLO')).toBe('HELLO');
  });
});
