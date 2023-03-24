/** Metadata schema types for Dynamic field */

export const dynamicFieldTypes = ['text', 'badge', 'datetime', 'state', 'enum', 'size', 'dict', 'list'];

export type DynamicFieldType = typeof dynamicFieldTypes[number];

export interface CommonOptions {
    link?: string;
    sortable?: boolean;
    sort_key?: string;
    width?: string;
    translation_id?: string;
    default?: any;
    delimiter?: string;
    is_optional?: boolean;
    field_description?: string;
    postfix?: string;
    prefix?: string;
}

export interface BadgeOptions extends CommonOptions {
    outline_color?: string;
    shape?: string;
    background_color?: string;
    text_color?: string;
}

export enum DATETIME_SOURCE_TYPE {
    // eslint-disable-next-line no-unused-vars
    iso8601 = 'iso8601',
    // eslint-disable-next-line no-unused-vars
    timestamp = 'timestamp'
}

export interface DatetimeOptions extends CommonOptions {
    source_type: keyof typeof DATETIME_SOURCE_TYPE;
    source_format?: string;
    display_format?: string;
}

export interface ListOptions extends CommonOptions {
    // eslint-disable-next-line no-use-before-define
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

export interface EnumItem {
    name?: string;
    type: DynamicFieldType;
    // eslint-disable-next-line no-use-before-define
    options?: DynamicFieldOptions;
    default?: any;
}
type EnumValue = EnumItem|string;
export type EnumOptions = {
    [data: string]: EnumValue;
    default?: any;
} | {
    items?: Record<string, EnumValue>;
    default?: any;
} & CommonOptions;

export interface SizeOptions extends CommonOptions {
    display_unit?: 'BYTES | KB | MB | GB | TB | PB';
    source_unit?: 'BYTES | KB | MB | GB | TB | PB';
}

export type DictOptions = CommonOptions;

export type TextOptions = CommonOptions;

export type DynamicFieldOptions =
    | BadgeOptions
    | DatetimeOptions
    | DictOptions
    | EnumOptions
    | ListOptions
    | StateOptions
    | TextOptions
    | SizeOptions;

export interface DynamicField {
    key: string;
    name?: string;
    type: DynamicFieldType;
    options?: DynamicFieldOptions;
}
