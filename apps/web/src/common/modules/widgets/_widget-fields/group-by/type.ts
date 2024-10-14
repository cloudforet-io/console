export interface GroupByValue {
    value?: string | string[];
    count?: number;
}

export interface GroupByOptions {
    dataTarget?: string;
    multiSelectable?: boolean;
    hideCount?: boolean;
    max?: number;
    defaultMaxCount: number;
    defaultIndex?: number;
    excludeDateField?: boolean;
    fixedValue?: string;
}
