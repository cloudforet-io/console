/* eslint-disable camelcase */
import { DynamicField } from '@/components/organisms/dynamic-field/type';
import { QuerySearchTableOptions } from '@/components/organisms/dynamic-layout/templates/query-search-table/type';

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
export interface DynamicLayoutProps extends Required<DynamicLayout> {
    data: any;
    extra: any;
    beforeCreate?: (props: DynamicLayoutProps) => void|Promise<void>;
    fetchHandler: (fetchOptions: any) => any|Promise<any>;
    timezone?: string;
}
