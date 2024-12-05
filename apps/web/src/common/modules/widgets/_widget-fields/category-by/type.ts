export interface CategoryByValue {
    value: string;
    count: number;
}

export interface CategoryByOptions {
    dataTarget?: string;
    max: number;
    defaultMaxCount: number;
    defaultIndex?: number;
    excludeDateField?: boolean;
}

export interface _CategoryByValue {
    data?: string;
    count: number;
}
