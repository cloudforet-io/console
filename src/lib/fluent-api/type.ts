/* eslint-disable camelcase */
import { Ref } from '@vue/composition-api';

export type ApiMethods = 'post' | 'get' | 'delete' | 'put';

export interface LongFilterType {
    key: string;
    value: string | string[];
    operator: string;
}

export interface FilterItem extends LongFilterType {
    key: string;
    value: string;
    operator: string;
}

export interface ShortFilterType {
    k: string;
    v: string | string[];
    o: string;
}

export type FilterType = LongFilterType | ShortFilterType;

export interface BaseActionState<T> {
    parameter: T;
}

export interface Sort {
    key: string;
    desc?: boolean;
}

export interface Page {
    start: number;
    limit?: number;
}

export interface Query {
    filter?: FilterType[];
    only?: string[];
    page?: Page;
    sort?: Sort;
    keyword?: string;
}

export interface QueryApiState {
    filter: FilterItem[];
    only: string[];
    thisPage: number;
    pageSize: number;
    sortBy: string;
    sortDesc: boolean;
    keyword: string;
    extraParameter: any;
    query: Readonly<Ref<Query>>;
}


export interface QueryActionState<T> extends BaseActionState<T & {query: Query}>, QueryApiState {}

export interface DataSourceItem {
    name: string;
    key: string;
    view_type?: string;
    view_option?: any;
}

export interface historyItem {
    update_at: number;
    key: string;
    update_by: string;
}

export interface CollectionInfo {
    update_history: historyItem[];
    state: string;
    collectors: string[];
    pinned_keys: string[];

}

export interface timestamp {
    seconds: string;
    nanos: number;
}

export interface ListType<T> {
    results: T[];
    total_count: number;
}
