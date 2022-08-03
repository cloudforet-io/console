/** Search schema types */
import type { DynamicField } from '@/component-util/dynamic-layout/field-schema';
import type { KeyDataType } from '@/component-util/query-search/type';

export interface SearchEnumItem {
    label: string;
    icon?: {
        image?: string;
        color?: string;
    };
}
export type SearchDataType = KeyDataType;
export type SearchEnums = Record<string, SearchEnumItem|string>|string[];

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
    'raw', 'markdown', 'list', 'raw-table', 'html',
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

export interface TableOptions extends CommonOptions {
    fields: DynamicField[];
}

export interface QuerySearchTableOptions extends CommonOptions {
    fields: DynamicField[];
    search: SearchSchema;
}

export type RawOptions = CommonOptions;

export type RawTableOptions = CommonOptions;

export type HtmlOptions = CommonOptions;

export interface MarkdownOptions extends CommonOptions {
    markdown: string|{
        en: string;
        ko: string;
    };
}

export interface ListOptions extends CommonOptions {
    // eslint-disable-next-line no-use-before-define
    layouts: DynamicLayout[];
}

export interface DynamicLayoutOptions extends
    ItemOptions, SimpleTableOptions, TableOptions,
    QuerySearchTableOptions, RawOptions, MarkdownOptions,
    RawTableOptions, HtmlOptions, ListOptions {}

export interface DynamicLayout {
    name: string;
    type: DynamicLayoutType;
    options?: DynamicLayoutOptions;
}
