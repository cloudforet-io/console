import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { referenceConfigMap } from '@/query/reference/reference-config';

export type ReferenceKeyType = keyof typeof referenceConfigMap;

export interface ReferenceFetchInfo<T> {
    listFetchFn: (params: any) => Promise<ListResponse<T>>;
    statFetchFn?: (params: any) => Promise<ListResponse<any>>;
    only?: string[];
    searchTargets?: string[];
    nameFormatter?: (...args: any) => string;
}

export interface ReferenceConfig {
    name: string;
    resourceKey: ReferenceKeyType;
    idKey: string;
    nameKey: string;
}
