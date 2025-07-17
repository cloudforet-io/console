import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';

export interface ReferenceItem<Data = Record<string, any>> {
    key: string;
    label: string;
    name: string;
    color?: string;
    icon?: string;
    provider?: string;
    continent?: {
        continent_code?: string;
        continent_label?: string;
        latitude?: number;
        longitude?: number;
    };
    latitude?: string;
    longitude?: string;
    data?: Data;
    description?: string;
    link?: string;
}

export type ReferenceMap<Item extends ReferenceItem = ReferenceItem> = Record<string, Item>;

export interface ReferenceConfig<T> {
    transform: (arg: T) => ReferenceItem;
    only: string[];
}

export interface ReferenceDataModelFetchConfig<T> {
    listFetcher: (arg: any) => Promise<ListResponse<T>>;
    query?: Query;
}
