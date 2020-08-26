/* eslint-disable camelcase */

import { DynamicField } from '@/components/organisms/dynamic-field/type/field-schema';

/** Metadata schema types for Dynamic layout */
export type DynamicLayoutType = 'item'|'simple-table'|'table'|'query-search-table'
    |'raw'|'markdown'|'list';

export interface CommonOptions {
    root_path?: string;
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
}

export type RawOptions = CommonOptions

export interface MarkdownOptions extends CommonOptions {
    markdown: string|{
        en: string;
        ko: string;
    };
}

export interface ListOptions extends CommonOptions {
    layouts: DynamicLayout[];
}

export interface DynamicLayoutOptions extends
    ItemOptions, SimpleTableOptions, TableOptions,
    QuerySearchTableOptions, RawOptions, MarkdownOptions,
    ListOptions {}


export interface DynamicLayout {
    name: string;
    type: DynamicLayoutType;
    options?: DynamicLayoutOptions;
}
