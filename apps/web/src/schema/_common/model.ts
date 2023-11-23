export interface Tags {
    [key: string]: any;
}

export interface TimeStamp {
    seconds: string;
    nanos?: number;
}

export interface ListResponse<T> {
    results: T[];
    total_count: number;
}

export interface AnalyzeResponse<T> {
    results: T[];
    more?: boolean;
}
