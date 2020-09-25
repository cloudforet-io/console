/* eslint-disable camelcase */
import { AxiosInstance, AxiosResponse } from 'axios';

const OPERATOR_MAP = Object.freeze({
    '': 'contain_in', // merge operator
    '!': 'not_contain', // merge operator
    '>': 'gt',
    '>=': 'gte',
    '<': 'lt',
    '<=': 'lte',
    '=': 'in', // merge operator
    '!=': 'not_in', // merge operator
    $: 'regex',
    td_lt: 'timediff_lt',
    td_gt: 'timediff_gt',
    td_lte: 'timediff_lte',
    td_gte: 'timediff_gte',
    in: 'in', // merge operator
    not_in: 'not_in', // merge operator
    contain_in: 'contain_in', // merge operator
    not_contain: 'not_contain', // merge operator
    eq: 'in', // merge operator
    not_eq: 'not_in', // merge operator
    sum: 'sum',
});
export type ApiMethods = 'post' | 'get' | 'delete' | 'put';

export interface LongFilterType {
    key: string;
    value: string | Array<string|null> | null;
    operator: string;
}

export enum FILTER_OPERATOR {
    contain = '',
    notContain = '!',
    gt = '>',
    gte = '>=',
    lt = '<',
    lte = '<=',
    in = '=',
    notIn = '!=',
    regex = '$',
    sum = 'sum',
    ltTime = 'td_lt',
    gtTime = 'td_gt',
    lteTime = 'td_lte',
    gteTime = 'td_gte',
}


export type OperatorType = keyof typeof OPERATOR_MAP;
// type OperatorType = '' | '!' | '>' | '>=' | '<' | '<=' | '=' | '!=' | '$'|
//     'td_lt'|'td_gt'|'td_lte'|'td_gte'|'in'|'not_in'|'contain_in'|'not_contain'|'eq'|'not_eq'|'sum';

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
    fixOnly: string[];
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
    fixOnly: string[];
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
    type?: string;
    options?: any;
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

export interface ActionAPIInterface<parameter=any, resp=any> {
    url: string;
    getParameter: () => parameter;
    execute: () => Promise<AxiosResponse<resp>>;
    setTransformer<returnType = any>(func: (resp: AxiosResponse<resp>) => returnType|Promise<returnType>): this;
    debug(...args: string[]): void;
    clone(): this;
}

export interface TreeResp<T> {
    items: T[];
}

export interface TreeParameter {
    item_type?: string;
    item_id?: string;
    sort?: {key: string; desc: boolean};
    exclude_type?: string;
}
