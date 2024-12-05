export interface XAxisValue {
    value: string;
    count: number;
}
export interface XAxisOptions {
    dataTarget: string;
    max: number;
    defaultMaxCount: number;
    defaultIndex?: number;
    excludeDateField?: boolean;
}
export interface _XAxisValue {
    data?: string;
    count: number;
}
