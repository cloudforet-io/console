/* eslint-disable camelcase */
import { DynamicField } from '@/components/organisms/dynamic-field/type';
import { Options as QuerySearchTableFetchOptions, QuerySearchTableProps } from '@/components/organisms/tables/query-search-table/type';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';

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
export interface DynamicLayoutProps<InitProps, Options, FetchOptions, Data> {
    name: string;
    type: DynamicLayoutType;
    options: Options;
    data?: Data;
    loading?: boolean;
    totalCount?: number;
    initProps?: InitProps; // a set of init values of extra props for each component
    timezone?: string;
    beforeCreate?: (props: InitProps) => void|Promise<void>;
}

export interface DynamicLayoutTemplateProps<InitProps, Options, Data> {
    name: string;
    options: Options;
    data?: Data;
    loading?: boolean;
    totalCount?: number;
    initProps?: InitProps;
    timezone?: string;
}

// Query Search Table
export type QuerySearchDynamicLayoutProps<T=any> = DynamicLayoutTemplateProps<
    QuerySearchTableProps,
    QuerySearchTableOptions,
    T[]
>
