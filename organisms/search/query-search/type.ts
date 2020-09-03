export const inputDataTypes = {
    string: 'text',
    integer: 'number',
    float: 'number',
    boolean: 'text',
    datetime: 'datetime-local',
};
export type KeyDataType = keyof typeof inputDataTypes;

export interface KeyItem {
    label: string;
    name: string;
    dataType?: KeyDataType;
}

export const operators = ['!', '>', '>=', '<', '<=', '=', '!=', '$'];
export type OperatorType = typeof operators[number];

export interface ValueItem<T=string> {
    label: string;
    name: T;
    icon?: string;
    link?: string;
    target?: string;
}

export interface QueryItem<T=string> {
    key?: KeyItem;
    operator: OperatorType;
    value: ValueItem<T>;
}


export type ValueHandler = (inputText: string, keyItem: KeyItem) => Promise<{
    results: ValueItem[];
    totalCount: number;
}>;

export interface ValueHandlerMap {
    [key: string]: ValueHandler;
}

export interface QuerySearchState {
    placeholder: string;
    focused: boolean;
    keyItems: KeyItem[];
    valueHandlerMap: ValueHandlerMap;
}
export interface QuerySearchSyncState {
    value: string;
}

export interface QuerySearchProps extends QuerySearchState, QuerySearchSyncState {
}

export interface QuerySearchListeners {
    search?: (query: QueryItem) => Promise<void>|void;
}
