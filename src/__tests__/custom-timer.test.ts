import { CustomTimer } from '../custom-timer';

// 幫助函數：創建一個延遲的Promise
function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

describe('Custom Timer', () => {
  beforeEach(() => {
    // Mock the timer functions like setTimeout
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  test('應該正確解析在超時前完成的Promise', async () => {
    const promise = delay(1000, 'success');
    const timer = new CustomTimer<string>();
    const resultPromise = timer.tryExecOrTimeout(promise, 3);
    // 執行
    jest.advanceTimersByTime(1000);
    const result = await resultPromise;
    expect(result.code).toBe(0);
    expect(result.message).toBe('');
    expect(result.result).toBe('success');
    expect(timer.isTerminated()).toBe(true);
  });
  test('應該在超時時拒絕Promise', async () => { 
    const promise = delay(3000, 'success');
    const timer = new CustomTimer<string>();
    const resultPromise = timer.tryExecOrTimeout(promise, 1);
    // 執行
    jest.advanceTimersByTime(3000);
    const result = await resultPromise;
    expect(result.isOK()).toBe(false)
    expect(result.code).toBe(99998);
    expect(result.message).toBe('Ops! Timeout');
    expect(timer.isTerminated()).toBe(true);
  });
  test('未終止時應正確報告狀態', () => {
    const promise = delay(1000, 'success');
    const timer = new CustomTimer<string>();
    timer.tryExecOrTimeout(promise, 3);

    expect(timer.isTerminated()).toBe(false);
   });
  test.only('多次調用tryExecOrTimeout應獨立執行', async () => { 
    const timer = new CustomTimer<string>();
    const promise1 = delay(50, 'first');
    const promise2 = delay(50, 'second');

    const resultPromise1 = timer.tryExecOrTimeout(promise1, 1);
    jest.advanceTimersByTime(50)
    const result1 = await resultPromise1;
    expect(result1.code).toBe(0);
    expect(result1.message).toBe('');
    expect(result1.result).toBe('first');

    timer.renew(); // 重新啟動計時器
    const resultPromise2 = timer.tryExecOrTimeout(promise2, 1);
    jest.advanceTimersByTime(50)
    const result2 = await resultPromise2;
    expect(result2.code).toBe(0);
    expect(result2.message).toBe('');
    expect(result2.result).toBe('second');
    expect(timer.isTerminated()).toBe(true);
  });
});