// import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';

export type ResourceKeyType = keyof typeof RESOURCE_CONFIG_MAP;
// export interface ReferenceFetchInfo<T> {
//     listFetchFn: (params: any) => Promise<ListResponse<T>>;
//     statFetchFn?: (params: any) => Promise<ListResponse<any>>;
//     only?: string[];
//     searchTargets?: string[];
//     nameFormatter?: (...args: any) => string;
// }
//
// export interface ReferenceConfig {
//     name: string;
//     resourceKey: ResourceKeyType;
//     idKey: string;
//     nameKey: string;
// }

export type ResourceCacheType<T extends Record<string, any>> = Record<string, T>;
