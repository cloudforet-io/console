export interface KeyItem {
    label: string;
    name: string;
    dataType?: string;
}

export type OperatorType = ''|'!'|'>'|'>='|'<'|'<='|'='|'!='|'$';

export interface ValueItem {
    label: string;
    name: string;
    icon?: string;
    link?: string;
    target?: string;
}

export interface QueryItem {
    key?: KeyItem;
    operator: OperatorType;
    value: ValueItem;
    // invalid?: boolean;
    // description?: string;
}

export interface QuerySearchState {
    placeholder: string;
    loading: boolean;
    focused: boolean;
    keyItems: KeyItem[];
    valueItems: ValueItem[];
    totalCount: number;
}
export interface QuerySearchSyncState {
    value: string;
}
export interface QuerySearchProps extends QuerySearchState, QuerySearchSyncState {
}
