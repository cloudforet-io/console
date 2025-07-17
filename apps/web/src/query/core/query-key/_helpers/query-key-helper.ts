import type {
    QueryKeyArray, ResourceName, ServiceName, Verb,
} from '@/query/core/query-key/types/query-key-type';
import { omitPageFromLoadParams, omitPageQueryParams } from '@/query/shared/utils/pagination-query-helper';

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


export const omitPageParamsByVerb = <S extends ServiceName, R extends ResourceName<S>>(verb: Verb<S, R>, params = {}) => {
    if (verb === 'load') return omitPageFromLoadParams(params);
    if (verb === 'list' || verb === 'analyze' || verb === 'stat') return omitPageQueryParams(params);
    return params;
};
