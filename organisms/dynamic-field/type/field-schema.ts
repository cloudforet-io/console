/* eslint-disable camelcase */

/** Metadata schema types for Dynamic field */

export const dynamicFieldTypes = ['text', 'badge', 'datetime', 'dict', 'state', 'enum', 'list', 'size'];

export type DynamicFieldType = typeof dynamicFieldTypes[number];

export interface CommonOptions {
    link?: string;
    sortable?: boolean;
    sort_key?: string;
    width?: string;
    translation_id?: string;
    default?: any;
}

export interface BadgeOptions extends CommonOptions {
    outline_color?: string;
    shape?: string;
    background_color?: string;
    text_color?: string;
}

export enum DATETIME_SOURCE_TYPE {
    iso8601 = 'iso8601',
    timestamp = 'timestamp'
}

export interface DatetimeOptions extends CommonOptions {
    source_type: keyof typeof DATETIME_SOURCE_TYPE;
    source_format?: string;
    display_format?: string;
}

export interface ListOptions extends CommonOptions {
    item?: DynamicField;
    sub_key?: string;
    delimiter?: string;
}

export interface StateOptions extends CommonOptions {
    icon?: {
        image?: string;
        color?: string;
    };
    text_color?: string;
}

export interface EnumOptions {
    [data: string]: {
        name?: string;
        type: DynamicFieldType;
        options?: DynamicFieldOptions;
    };
}

export interface SizeOptions extends CommonOptions {
    display_unit?: 'BYTES | KB | MB | GB | TB | PB';
    source_unit?: 'BYTES | KB | MB | GB | TB | PB';
}


export type DictOptions = CommonOptions

export type TextOptions = CommonOptions


export type DynamicFieldOptions =
    | BadgeOptions
    | DatetimeOptions
    | DictOptions
    | EnumOptions
    | ListOptions
    | StateOptions
    | TextOptions
    | SizeOptions


export interface DynamicField {
    key: string;
    name: string;
    type: DynamicFieldType;
    options?: DynamicFieldOptions;
}
