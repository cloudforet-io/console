import { MenuItem as ContextMenuItem } from '@/components/organisms/context-menu/type';

export const inputDataTypes = {
    string: 'text',
    integer: 'number',
    float: 'number',
    boolean: 'text',
    datetime: 'text',
    object: 'text',
};
export type KeyDataType = keyof typeof inputDataTypes;


export const operators = ['', '!', '>', '>=', '<', '<=', '=', '!=', '$'];
export type OperatorType = string;

export interface ValueItem {
    label: string;
    name: any;
}

export interface KeyItem extends ValueItem {
    dataType?: KeyDataType;
    subPaths?: string[];
    operators?: OperatorType[];
}

export interface QueryItem {
    key?: KeyItem;
    operator: OperatorType;
    value: ValueItem;
}

export type InputType ='KEY'|'VALUE'|'OPERATOR'

export interface MenuItem<T> extends ContextMenuItem {
    data?: T;
}

export type KeyMenuItem = MenuItem<KeyItem>;
export type ValueMenuItem = MenuItem<ValueItem>;
export type OperatorMenuItem = ValueMenuItem;

export interface HandlerResponse {
    results: ValueItem[];
    totalCount?: number;
    inputType?: InputType;
}
export type ValueHandler = (inputText: string, keyItem: KeyItem, operator?: string) => Promise<HandlerResponse>|HandlerResponse;


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

/** Input Templates */
export interface QuerySearchInputProps {
    isFocused: boolean;
    value: string;
    placeholder?: string;
    operator: OperatorType;
    visibleMenu?: boolean;
    handler?: ValueHandler|null;
    keyItem?: KeyItem;
    supportOperators?: OperatorType[];
}

export interface QuerySearchInputEventArgs {
    'update:operator': [OperatorType];
    search: [ValueItem];
    'update:visibleMenu': [boolean];
}
