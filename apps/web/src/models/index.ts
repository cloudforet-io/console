/* eslint-disable camelcase */
export interface Tags {
    [key: string]: any;
}

export interface TimeStamp {
    seconds: string;
    nanos?: number;
}

export interface ListType<T> {
    results: T[];
    total_count: number;
}
