export interface GroupByValue {
    data?: string | string[];
    count?: number;
}

export interface GroupByOptions {
    dataTarget: string;
    multiSelectable?: boolean;
    hideCount?: boolean;
    max?: number;
    defaultMaxCount?: number;
    excludeDateField?: boolean;
    fixedValue?: string;
}
