/** Metadata schema types for Dynamic field */
// eslint-disable-next-line import/no-cycle
import type { DynamicLayout } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';

export const dynamicFieldTypes = ['text', 'badge', 'datetime', 'state', 'enum', 'size', 'dict', 'list', 'more'];

export type DynamicFieldType = typeof dynamicFieldTypes[number];

export interface CommonOptions {
    link?: string;
    sortable?: boolean;
    sort_key?: string;
    key_depth?: number;
    width?: string;
    translation_id?: string;
    default?: any;
    delimiter?: string;
    is_optional?: boolean;
    field_description?: string;
    postfix?: string;
    prefix?: string;
    disable_copy?: boolean;
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

interface StateIcon {
    image?: string;
    color?: string;
}
export interface StateOptions extends CommonOptions {
    icon?: StateIcon;
    text_color?: string;
}

export interface MoreOptions extends CommonOptions {
    sub_key?: string;
    layout: DynamicLayout;
}

export interface EnumItem {
    name?: string;
    type: DynamicFieldType;
    options?: DynamicFieldOptions;
    default?: any;
}
type EnumValue = EnumItem|string;
type OldEnumOptions = Record<string, EnumValue>;
interface NewEnumOptions extends CommonOptions {
    items?: Record<string, EnumValue>;
    default?: any;
}
export type EnumOptions = OldEnumOptions|NewEnumOptions;

export interface SizeOptions extends CommonOptions {
    display_unit?: 'BYTES | KB | MB | GB | TB | PB';
    source_unit?: 'BYTES | KB | MB | GB | TB | PB';
}


export type DictOptions = CommonOptions;

export type TextOptions = CommonOptions;


export interface DynamicFieldOptions extends CommonOptions {
    // badge
    outline_color?: string;
    shape?: string;
    background_color?: string;
    text_color?: string; // + state
    // datetime
    source_type?: keyof typeof DATETIME_SOURCE_TYPE;
    source_format?: string;
    display_format?: string;
    // list
    item?: DynamicField;
    sub_key?: string; // + more
    delimiter?: string;
    // state
    icon?: StateIcon;
    // more
    layout?: DynamicLayout;
    // enum
    items?: Record<string, EnumValue>;
    default?: any;
}

export interface DynamicField {
    key: string;
    name?: string;
    type: DynamicFieldType;
    options?: DynamicFieldOptions;
    reference?: {
        resource_type: string;
        reference_key?: string;
    };
}
