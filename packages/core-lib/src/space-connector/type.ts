import type { AxiosResponse } from 'axios';

export interface SessionTimeoutCallback {
    (): void;
}

export const RESPONSE = {
    API_ERROR: 'APIError',
    BAD_REQUEST_ERROR: 'BadRequestError',
    NOT_FOUND_ERROR: 'NotFoundError',
    AUTHENTICATION_ERROR: 'AuthenticationError',
    AUTHORIZATION_ERROR: 'AuthorizationError',
} as const;

export type RESPONSE = typeof RESPONSE[keyof typeof RESPONSE];

export interface Response<T> {
    code: RESPONSE | string;
    message: string;
    result: T;
}

export interface APIInfo {
    path: string;
    methods: Array<string>;
}

interface ErrorModel {
    message: string;
    code: string;
}

export interface ServerError {
    status: string;
    error: ErrorModel;
    statusText: string;
}

interface PostResponse {
    access_token: string;
    refresh_token: string;
    apis: APIInfo[];
}

export type AxiosPostResponse = AxiosResponse<PostResponse>;

export type ApiFilterOperator =
    | 'lt' | 'lte' | 'gt' | 'gte' | 'exists' | 'regex'
    | 'eq' | 'contain' | 'not' | 'not_contain'
    | 'in' | 'contain_in' | 'not_in' | 'not_contain_in' | 'regex_in'
    | 'datetime_lt' | 'datetime_lte' | 'datetime_gt' | 'datetime_gte'
    | 'timediff_lt' | 'timediff_lte' | 'timediff_gt' | 'timediff_gte';

export interface ApiFilter {
    k: string;
    v: any;
    o: ApiFilterOperator;
}

export interface Sort {
    key: string;
    desc?: boolean;
}

export interface Query {
    filter?: Array<ApiFilter>;
    filter_or?: Array<ApiFilter>;
    page?: {
        start?: number;
        limit?: number;
    };
    sort?: Sort[];
    only?: Array<string>;
    keyword?: string;
    minimal?: boolean;
    count_only?: boolean;
    distinct?: string;
}


export interface AnalyzeField {
    [key: string]: {
        key: string;
        operator: 'sum'|'average'|'count'|'max'|'min'|'push'|'add_to_set';
    };
}
// unwind의 filter의 경우 TimeSeriesAnalyzeQuery에서의 겨웅에만 filter가 존재하며, RealTimeAnalyzeQuery에서는 filter가 존재하지 않습니다. (Granularity가 있으면 TimeSeriesAnalyzeQuery, Granularity가 없으면 RealTimeAnalyzeQuery)
// In the case of TimeSeriesAnalyzeQuery, the filter exists only when filter exists, and in the case of RealTimeAnalyzeQuery, the filter does not exist.
export interface AnalyzeQuery {
    granularity?: 'YEARLY'|'MONTHLY'|'DAILY';
    start?: string;
    end?: string;
    unwind?: {
        path?: string;
        filter?: Array<ApiFilter>;
    };
    group_by?: Array<string>;
    field_group?: Array<string>;
    filter?: Array<ApiFilter>;
    filter_or?: Array<ApiFilter>;
    page?: {
        start?: number;
        limit?: number;
    };
    sort?: Sort[];
    fields?: AnalyzeField;
    select?: any;
}

export interface MockConfig {
    enabled?: boolean;
    endpoints?: string[]; // [v1_endpoint, v2_endpoint]
    reflection?: boolean[]; // [v1_reflection, v2_reflection]
    apiList?: string[][]; // [[v1_api_1, v1_api_2], [v2_api_1, v2_api_2, v2_api_3]]
    apiKey?: string;
}
export interface AuthConfig {
    enabled?: boolean;
    skipTokenCheck?: boolean;
    apiKey?: string;
}
export interface DevConfig {
    enabled?: boolean;
    mockConfig?: MockConfig;
    authConfig?: AuthConfig;
}
