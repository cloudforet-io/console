/* eslint-disable camelcase */
import { DynamicField } from '@/components/organisms/dynamic-field/type';
import { QueryTag } from '@/components/organisms/search/query-search-tags/PQuerySearchTags.toolset';
import { QuerySearchTableProps } from '@/components/organisms/tables/query-search-table/type';

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

/** Props for Dynamic layout component */
export interface DynamicLayoutProps<InitProps, Options, Data> {
    name: string;
    type: DynamicLayoutType;
    options: Options;
    data?: Data;
    loading?: boolean;
    totalCount?: number;
    timezone?: string;
    beforeCreate?: (props: any) => void|Promise<void>;
    initProps?: InitProps;
}

export interface DynamicLayoutFetchOptions {
    sortBy: string;
    sortDesc: boolean;
    pageStart: number;
    pageLimit: number;
    queryTags: QueryTag[];
    selectIndex: number[];
}

/** Dynamic Layout Event Listeners */
export interface DynamicLayoutEventListeners {
    init: (options: DynamicLayoutFetchOptions) => void|Promise<void>;
    fetch: (options: DynamicLayoutFetchOptions,
             changedOptions: Partial<DynamicLayoutFetchOptions>) => void|Promise<void>;
    select: (selectIndex: number[]) => void|Promise<void>;
}

/** Props for each template component that matches to dynamic layout types */
export type DynamicLayoutTemplateProps<InitProps, Options, Data> =
    Omit<DynamicLayoutProps<InitProps, Options, Data>, 'type' | 'beforeCreate'>;
