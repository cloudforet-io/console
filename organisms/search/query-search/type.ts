import { MenuItem as ContextMenuItem } from '@/components/organisms/context-menu/type';


export const dataTypes = ['string', 'integer', 'float', 'boolean', 'datetime', 'object'] as const;
export type KeyDataType = typeof dataTypes[number];


export const operators = ['', '!', '>', '>=', '<', '<=', '=', '!=', '$'] as const;
export type OperatorType = typeof operators[number];

export interface ValueItem {
    label: string;
    name: any;
}


export interface KeyItem {
    label: string;
    name: any;
    dataType?: KeyDataType;
    operators?: OperatorType[];
}

export interface QueryItem {
    key?: KeyItem;
    operator: OperatorType;
    value: ValueItem;
    subPath?: string;
}

export type MenuType ='KEY'|'VALUE'|'OPERATOR'

export interface MenuItem<T> extends ContextMenuItem {
    data?: T;
}

export type KeyMenuItem = MenuItem<KeyItem>;
export type ValueMenuItem = MenuItem<ValueItem>;

export interface HandlerResponse {
    results: ValueItem[];
    totalCount?: number;
    dataType?: KeyDataType;
    operators?: OperatorType[];
}
export type ValueHandler = (inputText: string, keyItem: KeyItem, subPath?: string, operator?: string) => Promise<HandlerResponse>|HandlerResponse;


export interface ValueHandlerMap {
    [key: string]: ValueHandler|undefined;
}

export interface QuerySearchProps {
    placeholder?: string;
    focused: boolean;
    keyItems: KeyItem[];
    valueHandlerMap: ValueHandlerMap;
    value: string;
}

export interface QuerySearchEventArgs {
    search: [QueryItem];
}
