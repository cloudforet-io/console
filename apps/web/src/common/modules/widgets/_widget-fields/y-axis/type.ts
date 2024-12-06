export interface YAxisValue {
    value: string;
    count: number;
}

export interface YAxisOptions {
    dataTarget: string;
    max: number;
    defaultMaxCount: number;
    defaultIndex?: number;
    excludeDateField?: boolean;
}
export interface _YAxisValue {
    data?: string;
    count: number;
}
