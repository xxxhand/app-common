import { mySum } from '../index';

describe('Sum tests', () => {
    it('should return 11', () => {
        expect(mySum(6, 5)).toBe(11);
    });
});
