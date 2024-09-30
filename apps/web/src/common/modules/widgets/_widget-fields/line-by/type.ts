export interface LineByValue {
    value: string;
    count: number;
}

export interface LineByOptions {
    dataTarget?: string;
    max?: number;
    defaultMaxCount: number;
    defaultIndex?: number;
    excludeDateField?: boolean;
}
