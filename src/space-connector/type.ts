/* eslint-disable camelcase */

export interface SessionTimeoutCallback {
    (): void;
}

export interface APIInfo {
    path: string;
    methods: Array<string>;
}

export type FilterOperator =
    | 'lt' | 'lte' | 'gt' | 'gte' | 'exists' | 'regex'
    | 'eq' | 'contain' | 'not' | 'not_contain'
    | 'in' | 'contain_in' | 'not_in' | 'not_contain_in'
    | 'datetime_lt' | 'datetime_lte' | 'datetime_gt' | 'datetime_gte'
    | 'timediff_lt' | 'timediff_lte' | 'timediff_gt' | 'timediff_gte';

export interface Filter {
    k: string;
    v: any;
    o: FilterOperator;
}

export interface Query {
    filter?: Array<Filter>;
    filter_or?: Array<Filter>;
    page?: {
        start?: number;
        limit?: number;
    };
    sort?: {
        key?: string;
        name?: string;
        desc?: boolean;
    };
    only?: Array<string>;
    keyword?: string;
    minimal?: boolean;
    count_only?: boolean;
}

export interface MockInfo {
    all?: boolean;
    endpoint?: string;
}
