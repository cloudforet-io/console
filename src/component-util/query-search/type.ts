const CONTEXT_MENU_TYPE = {
    divider: 'divider',
    header: 'header',
    item: 'item',
} as const;
type CONTEXT_MENU_TYPE = typeof CONTEXT_MENU_TYPE[keyof typeof CONTEXT_MENU_TYPE];

export const dataTypes = ['string', 'integer', 'float', 'boolean', 'datetime', 'object'] as const;
export type KeyDataType = typeof dataTypes[number];

export const operators = ['', '!', '>', '>=', '<', '<=', '=', '!=', '$'] as const;
export type OperatorType = typeof operators[number];

export interface KeyItem {
    label: string;
    name: any;
    dataType?: KeyDataType;
    operators?: OperatorType[];
}

export interface KeyItemSet {
    title: string;
    items: KeyItem[];
}

export interface MenuItem<T> {
    type?: CONTEXT_MENU_TYPE;
    data?: T;
}

export interface ValueItem {
    label: string;
    name: any;
}

export interface ValueMenuItem extends ValueItem, MenuItem<ValueItem> {}

export interface HandlerResponse {
    results: Array<ValueMenuItem>;
    totalCount?: number;
    dataType?: KeyDataType;
    operators?: OperatorType[];
}

export interface ValueHandler {
    (inputText: string,
     rootKey: KeyItem,
     dataType?: KeyDataType,
     subPath?: string,
     operator?: OperatorType): Promise<HandlerResponse>|HandlerResponse;
}


export interface ValueHandlerMap {
    [key: string]: ValueHandler|undefined;
}

export interface QueryItem {
    key?: KeyItem;
    operator?: OperatorType;
    value: ValueItem;
}

export interface QueryTag extends QueryItem {
    invalid?: boolean;
    description?: string;
}

/** Search schema types */
export interface SearchEnumItem {
    label: string;
    icon?: {
        image?: string;
        color?: string;
    };
}
export type SearchEnums = Record<string, SearchEnumItem|string>|string[]
