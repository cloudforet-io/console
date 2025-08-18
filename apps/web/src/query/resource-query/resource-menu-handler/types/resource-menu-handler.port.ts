import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { StatResponse } from '@/api-clients/_common/schema/api-verbs/stat';

export interface ResourceMenuHandlerFetchConfig<TModelData extends Record<string, any>> {
    list?: ResourceMenuHandlerListFetcher<TModelData>;
    stat?: ResourceMenuHandlerStatFetcher;
}

export type ResourceMenuHandlerListFetcher<
TModelData extends Record<string, any>
> = (arg: any) => Promise<ListResponse<TModelData>>;

export type ResourceMenuHandlerStatFetcher = (arg: any) => Promise<StatResponse>;

export interface ResourceMenuHandlerListFetchConfig<TModelData extends Record<string, any>> {
    fetcher: ResourceMenuHandlerListFetcher<TModelData>;
    idKey: string;
    only?: string[];
    menuFilters?: ConsoleFilter[];
    searchTargets?: string[];
}

export interface ResourceMenuHandlerStatFetchConfig {
    fetcher: ResourceMenuHandlerStatFetcher;
    distinct: string;
    menuFilters?: ConsoleFilter[];
    searchTargets?: string[];
}
