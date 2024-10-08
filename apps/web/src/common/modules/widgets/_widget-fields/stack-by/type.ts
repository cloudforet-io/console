
export interface StackByValue {
    value: string;
    count: number;
}

export interface StackByOptions {
    dataTarget?: string;
    max?: number;
    defaultMaxCount: number;
    defaultIndex?: number;
    excludeDateField?: boolean;
}
