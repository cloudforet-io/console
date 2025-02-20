
export interface SankeyDimensionsOptions {
    dataTarget: 'data_info' | 'labels_info';
    max: number;
    defaultMaxCount: number;
}
export interface SankeyDimensionsValue {
    data?: string[];
    count: number;
}
