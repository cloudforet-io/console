import { LocalStorageAccessor } from '@/local-storage-accessor';

describe('LocalStorageAccessor:default', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('set/get string value', () => {
        const key = 'test';
        const value = 'string1';
        LocalStorageAccessor.setItem(key, value);
        expect(LocalStorageAccessor.getItem(key)).toEqual('string1');
    });
    test('set/get string null value', () => {
        const key = 'test';
        const value = 'null';
        LocalStorageAccessor.setItem(key, value);
        expect(LocalStorageAccessor.getItem(key)).toEqual(null);
    });
    test('set/get number value', () => {
        const key = 'test';
        const value = 123;
        LocalStorageAccessor.setItem(key, value);
        expect(LocalStorageAccessor.getItem(key)).toEqual(123);
    });
    test('set/get boolean value', () => {
        const key = 'test';
        const value = true;
        LocalStorageAccessor.setItem(key, value);
        expect(LocalStorageAccessor.getItem(key)).toEqual(true);
    });
    test('set/get object value', () => {
        const key = 'test';
        const value = { a: 1, b: 2 };
        LocalStorageAccessor.setItem(key, value);
        expect(LocalStorageAccessor.getItem(key)).toEqual({ a: 1, b: 2 });
    });
    test('set/get array value', () => {
        const key = 'test';
        const value = [1, { a: 1, b: '2' }, null, true, 'string'];
        LocalStorageAccessor.setItem(key, value);
        expect(LocalStorageAccessor.getItem(key)).toEqual([1, { a: 1, b: '2' }, null, true, 'string']);
    });
    test('set/get null value', () => {
        const key = 'test';
        const value = null;
        LocalStorageAccessor.setItem(key, value);
        expect(LocalStorageAccessor.getItem(key)).toEqual(null);
    });
    test('set/get undefined in object', () => {
        const key = 'test';
        const value = { a: undefined, b: null };
        LocalStorageAccessor.setItem(key, value);
        console.log('>>>', LocalStorageAccessor.getItem(key));
        expect(LocalStorageAccessor.getItem(key)).toEqual({ b: null });
    });
});

describe('LocalStorageAccessor:disableParse', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('set/get string value', () => {
        const key = 'test';
        const value = 'string1';
        LocalStorageAccessor.setItem(key, value);
        expect(LocalStorageAccessor.getItem(key)).toEqual(value);
    });
    test('set/get string null value', () => {
        const key = 'test';
        const value = 'null';
        LocalStorageAccessor.setItem(key, value);
        expect(LocalStorageAccessor.getItem(key, true)).toEqual('null');
    });
    test('set/get number value', () => {
        const key = 'test';
        const value = 123;
        LocalStorageAccessor.setItem(key, value);
        expect(LocalStorageAccessor.getItem(key, true)).toEqual('123');
    });
    test('set/get boolean value', () => {
        const key = 'test';
        const value = true;
        LocalStorageAccessor.setItem(key, value);
        expect(LocalStorageAccessor.getItem(key, true)).toEqual('true');
    });
    test('set/get object value', () => {
        const key = 'test';
        const value = { a: 1, b: 2 };
        LocalStorageAccessor.setItem(key, value);
        expect(LocalStorageAccessor.getItem(key, true)).toEqual('{"a":1,"b":2}');
    });
    test('set/get array value', () => {
        const key = 'test';
        const value = [1, { a: 1, b: '2' }, null, true, 'string'];
        LocalStorageAccessor.setItem(key, value);

        expect(LocalStorageAccessor.getItem(key, true)).toEqual('[1,{"a":1,"b":"2"},null,true,"string"]');
    });
    test('set/get null value', () => {
        const key = 'test';
        const value = null;
        LocalStorageAccessor.setItem(key, value);
        expect(LocalStorageAccessor.getItem(key, true)).toEqual('null');
    });
});
