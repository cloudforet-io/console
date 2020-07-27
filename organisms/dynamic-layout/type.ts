/* eslint-disable camelcase */
import { DynamicField } from '@/components/organisms/dynamic-field/type';

/** Metadata schema types for Dynamic layout */
export enum DYNAMIC_LAYOUT_TYPE {
'item' = 'item',
'simple-table' = 'simple-table',
'table' = 'table',
'query-search-table' = 'query-search-table',
'raw' = 'raw',
'markdown' = 'markdown',
'list' = 'list',
}

export type DynamicLayoutType = keyof typeof DYNAMIC_LAYOUT_TYPE;

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

export interface QuerySearchTableOptions {
    fields: DynamicField[];
}

export type RawOptions = CommonOptions

export interface MarkdownOptions {
    markdown: string|{
        en: string;
        ko: string;
    };
}

export type DynamicLayoutOptions =
    ItemOptions | SimpleTableOptions | TableOptions |
    QuerySearchTableOptions | RawOptions | MarkdownOptions


export interface DynamicLayout {
    name: string;
    type: DynamicLayoutType;
    options?: DynamicLayoutOptions;
}

/** Props type for Dynamic layout component */
export interface DynamicLayoutProps extends Required<DynamicLayout> {
    data: any;
    extra: any;
    beforeCreate?: (props: DynamicLayoutProps) => void|Promise<void>;
}
