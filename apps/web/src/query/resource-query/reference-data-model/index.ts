import { referenceDataModelMap } from '@/query/resource-query/reference-data-model/adaptors/registry';
import { makeReferenceDataModelProxy } from '@/query/resource-query/shared/utils/resource-proxy-helper';


const proxy = makeReferenceDataModelProxy(referenceDataModelMap, (target, prop) => {
    if (!(prop in target)) {
        throw new Error(`[all-reference-data-model] Reference Data Model for "${prop}" not found`);
    }
    return target[prop]().map;
});

export const useAllReferenceDataModel = () => proxy;
export * from './adaptors/implementations';

