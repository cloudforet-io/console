// eslint-disable-next-line import/no-cycle
import type { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import type { KeyDataType } from '@/inputs/search/query-search/type';

/** Search schema types */
export interface SearchEnumItem {
    label: string;
    icon?: {
        image?: string;
        color?: string;
    };
}
export type SearchDataType = KeyDataType;
export type SearchEnums = Record<string, SearchEnumItem|string>|string[];

export type Sort = {
    key: string;
    desc?: boolean;
};

export interface SearchKeyOptions {
    key: string; // Key to retrieve actual data
    name: string; // Name to display in search bar
    enums?: SearchEnums;
    data_type?: SearchDataType;
    icon?: string;
}

export interface SearchKeyGroup {
    title: string;
    items: SearchKeyOptions[];
    options?: object;
}

export type SearchSchema = SearchKeyGroup;

/** Metadata schema types for Dynamic layout */
export const dynamicLayoutTypes = [
    'item', 'simple-table', 'table', 'query-search-table',
    'raw', 'markdown', 'list', 'raw-table', 'html', 'popup',
];
export type DynamicLayoutType = typeof dynamicLayoutTypes[number];

export interface CommonOptions {
    root_path?: string;
    translation_id?: string;
}

export interface ItemOptions extends CommonOptions {
    fields: DynamicField[];
}

export interface SimpleTableOptions extends CommonOptions {
    fields: DynamicField[];
}

export interface RawTableOptions extends CommonOptions {
    disable_search?: boolean;
    headers?: string[];
}

export interface TableOptions extends CommonOptions {
    fields: DynamicField[];
    disable_search?: boolean;
    default_sort?: Sort;
}

export interface QuerySearchTableOptions extends CommonOptions {
    fields: DynamicField[];
    search: SearchSchema;
    disable_search?: boolean;
    default_sort?: Sort;
}

export type RawOptions = CommonOptions;


export type HtmlOptions = CommonOptions;

export interface MarkdownOptions extends CommonOptions {
    markdown: string|{
        en: string;
        ko: string;
    };
}

export interface PopupOptions extends CommonOptions {
    layout: DynamicLayout;
}

export interface ListOptions extends CommonOptions {
    layouts: DynamicLayout[];
}


export interface DynamicLayoutOptions extends
    ItemOptions, SimpleTableOptions, TableOptions,
    QuerySearchTableOptions, RawOptions, MarkdownOptions,
    RawTableOptions, HtmlOptions, PopupOptions, ListOptions {}


export interface DynamicLayout {
    name: string;
    type: DynamicLayoutType;
    options?: DynamicLayoutOptions;
}
