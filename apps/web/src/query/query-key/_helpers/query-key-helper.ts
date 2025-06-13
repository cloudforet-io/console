import type { QueryKeyArray } from '@/query/query-key/types/query-key-type';

export const createImmutableObjectKeyItem = <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => createImmutableObjectKeyItem(item)) as unknown as T;
    }

    const immutableObj = Object.entries(obj).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: createImmutableObjectKeyItem(value),
    }), {});

    return Object.freeze(immutableObj) as T;
};

export const normalizeQueryKeyPart = (key: unknown): QueryKeyArray => {
    if (Array.isArray(key)) {
        return key;
    }
    return [key];
};
