import type { ContextMenuType } from '@/inputs/context-menu/type';


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

export interface CategoryItem {
    label?: string;
    name: any;
}

export interface ValueItem {
    label: string;
    name: any;
    icon?: string;
    imageUrl?: string;
}

export type ValueSet = Record<string, ValueItem>;

export interface KeyItem {
    label: string;
    name: any;
    valueSet?: ValueSet;
    dataType?: KeyDataType;
    operators?: OperatorType[];
}

export interface QueryItem {
    key?: KeyItem;
    operator?: OperatorType;
    value: ValueItem;
    error?: boolean;
}

export type MenuType ='ROOT_KEY'|'KEY'|'VALUE'|'OPERATOR';

export interface MenuItem<T> {
    type?: ContextMenuType;
    data?: T;
}

export interface KeyMenuItem extends KeyItem, MenuItem<KeyItem> {}
export interface ValueMenuItem extends ValueItem, MenuItem<ValueItem> {}

export interface HandlerResponse {
    results: Array<ValueMenuItem>;
    totalCount?: number;
    dataType?: KeyDataType;
    operators?: OperatorType[];
    more?: boolean;
}
export interface ValueHandler {
    (inputText: string|number,
     rootKey: KeyItem,
     dataType?: KeyDataType,
     subPath?: string,
     operator?: OperatorType): Promise<HandlerResponse>|HandlerResponse;
}


export interface ValueHandlerMap {
    [key: string]: ValueHandler|undefined;
}

export interface KeyItemSet {
    title: string;
    items: KeyItem[];
}

export interface QuerySearchEventArgs {
    search: [QueryItem];
}

export interface MenuFormatterArgs {
    menuResponse: HandlerResponse;
    selectedKeys: KeyItem[];
    operator?: OperatorType;
    subPath?: string;
    hideKey?: boolean;
}
