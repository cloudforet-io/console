/* eslint-disable camelcase */
import { AxiosInstance } from 'axios';

export type ApiMethods = 'post' | 'get' | 'delete' | 'put';

export interface LongFilterType {
    key: string;
    value: string | Array<string|null> | null;
    operator: string;
}

type OperatorType = '' | '!' | '>' | '>=' | '<' | '<=' | '=' | '!=' | '$'|
    'td_lt'|'td_gt'|'td_lte'|'td_gte'|'in'|'not_in'|'contain_in'|'not_contain'|'eq'|'not_eq';

export interface FilterItem extends LongFilterType {
    key: string;
    value: string | Array<string|null> | null;
    operator: OperatorType;
}

export interface ShortFilterType {
    k: string;
    v: string | Array<string|null> | null;
    o: string;
}

export type FilterType = LongFilterType | ShortFilterType;

export interface RawParameterActionState<T> {
    parameter: T ;
}

export interface GetActionState<T> {
    parameter: T;
    only: string[];
}

export interface Sort {
    key: string;
    desc?: boolean;
}

export interface Page {
    start: number;
    limit?: number;
}

export interface BaseQuery {
    filter?: FilterType[];
    filter_or?: FilterType[];
}

export interface BaseQueryState<param> {
    filter: FilterItem[];
    filterOr: FilterItem[];
    fixFilter: FilterItem[];
    fixFilterOr: FilterItem[];
    extraParameter: param;
    // query: () => StatQuery;
}

export interface Query extends BaseQuery {
    filter?: FilterType[];
    only?: string[];
    page?: Page;
    sort?: Sort;
    keyword?: string;
    count_only?: boolean;
}

export interface QueryApiState<T=any> extends BaseQueryState<T> {
    only: string[];
    thisPage: number;
    pageSize: number;
    sortBy: string;
    sortDesc: boolean;
    keyword: string;
    extraParameter: T;
    count_only: boolean;
    query: () => Query;
}

export interface DataSourceItem {
    name: string;
    key: string;
    view_type?: string;
    view_option?: any;
}

export interface DynamicFormItem {
    type: string;
    is_required: boolean;
    name: string;
    key: string;
}


export interface DynamicViewMetaData {
    name: string;
    data_source: DataSourceItem[];
}

export interface DefaultMetaData{
    details?: DynamicViewMetaData;
    sub_data?: DynamicViewMetaData;
}

export interface HistoryItem {
    update_at: number;
    key: string;
    update_by: string;
}

export interface CollectionInfo {
    update_history: HistoryItem[];
    state: string;
    collectors: string[];
    pinned_keys: string[];

}


export interface TimeStamp {
    seconds: string;
    nanos?: number;
}

export interface ListType<T> {
    results: T[];
    total_count: number;
}

export interface LogListType<T> {
    logs: T[];
}

export interface ReferenceInfo {
    resource_id?: string;
    external_link?: string;
}

export interface Tags {
    tags?: {
        [key: string]: any;
    };
}

export interface ProjectGroupInfo extends Tags {
    project_group_id: string;
    name: string;
    parent_project_group_info: null | ProjectGroupInfo;
    domain_id: string;
    created_by: string;
    created_at: TimeStamp;
    deleted_at: TimeStamp;
}

export interface ApiType {
    instance: AxiosInstance;
}
