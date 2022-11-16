const CONTEXT_MENU_TYPE = {
    divider: 'divider',
    header: 'header',
    item: 'item',
} as const;
type CONTEXT_MENU_TYPE = typeof CONTEXT_MENU_TYPE[keyof typeof CONTEXT_MENU_TYPE];

export const dataTypes = ['string', 'integer', 'float', 'boolean', 'datetime', 'object'] as const;
export type KeyDataType = typeof dataTypes[number];

export const OPERATOR = Object.freeze({
    contain: '',
    notContain: '!',
    greater: '>',
    greaterEqual: '>=',
    less: '<',
    lessEqual: '<=',
    equal: '=',
    notEqual: '!=',
    regex: '~',
} as const);

export const operators = Object.values(OPERATOR);
export type OperatorType = typeof OPERATOR[keyof typeof OPERATOR];

export interface ValueItem {
    label: string;
    name: any;
}

export interface KeyItem {
    label: string;
    name: any;
    dataType?: KeyDataType;
    operators?: OperatorType[];
    reference?: string;
    valueSet?: Record<string, ValueItem>
}

export interface QueryItem {
    key?: KeyItem;
    operator?: OperatorType;
    value: ValueItem;
}

export type MenuType ='ROOT_KEY'|'KEY'|'VALUE'|'OPERATOR';

export interface MenuItem<T> {
    type?: CONTEXT_MENU_TYPE;
    data?: T;
}

export interface KeyMenuItem extends KeyItem, MenuItem<KeyItem> {}
export interface ValueMenuItem extends ValueItem, MenuItem<ValueItem> {}

export interface HandlerResponse {
    results: Array<ValueMenuItem>;
    totalCount?: number;
    dataType?: KeyDataType;
    operators?: OperatorType[];
}
export interface ValueHandler {
    // eslint-disable-next-line no-unused-vars
    (inputText: string,
     // eslint-disable-next-line no-unused-vars
        rootKey: KeyItem,
     // eslint-disable-next-line no-unused-vars
        dataType?: KeyDataType,
     // eslint-disable-next-line no-unused-vars
        subPath?: string,
     // eslint-disable-next-line no-unused-vars
        operator?: OperatorType): Promise<HandlerResponse>|HandlerResponse;
}

export interface ValueHandlerMap {
    [key: string]: ValueHandler|undefined;
}

export interface KeyItemSet {
    title: string;
    items: KeyItem[];
}

export interface QuerySearchProps {
    placeholder?: string;
    focused: boolean;
    keyItemSets: KeyItemSet[];
    valueHandlerMap: ValueHandlerMap;
    value: string;
}

export interface QueryTag extends QueryItem {
    invalid?: boolean;
    description?: string;
}

export interface QueryTagValidator {
    // eslint-disable-next-line no-unused-vars
    (query: QueryTag, tags: QueryTag[]): boolean;
}

export interface QueryTagConverter {
    // eslint-disable-next-line no-unused-vars
    (query: QueryItem, timezone: string): QueryTag;
}

export interface QuerySearchTagsProps {
    tags: QueryTag[];
    timezone: string;
    validator?: QueryTagValidator;
    converter?: QueryTagConverter;
    readOnly: boolean;
}
