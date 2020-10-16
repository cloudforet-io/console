import { DynamicLayoutOptions, DynamicLayoutType } from '@/components/organisms/dynamic-layout/type/layout-schema';
import { QueryTag } from '@/components/organisms/search/query-search-tags/type';
import { KeyItem, ValueHandlerMap } from '@/components/organisms/search/query-search/type';
import {
    BeforeCreateDynamicField,
    DynamicFieldHandler,
    DynamicFieldTypeOptions,
} from '@/components/organisms/dynamic-field/type';
import { DynamicField, DynamicFieldOptions } from '@/components/organisms/dynamic-field/type/field-schema';


export interface DynamicLayoutFetchOptions {
    sortBy: string;
    sortDesc: boolean;
    pageStart: number;
    pageLimit: number;
    queryTags: QueryTag[];
    searchText: string;
    listMap?: Record<string, Partial<DynamicLayoutFetchOptions>>;
}

export interface DynamicLayoutTypeOptions {
    loading: boolean;
    totalCount: number;
    timezone: string;
    selectIndex: number[];
    selectable: boolean;
    colCopy: boolean;
    searchable: boolean;
    excelVisible: boolean;
    keyItems: KeyItem[];
    valueHandlerMap: ValueHandlerMap;
    language: string;
    listMap?: Record<string, Partial<DynamicLayoutTypeOptions>>;
}

export interface DynamicLayoutProps<
    SchemaOptions = DynamicLayoutOptions,
        FetchOptions = DynamicLayoutFetchOptions,
    TypeOptions = DynamicLayoutTypeOptions
    > {
    name: string;
    type: DynamicLayoutType;
    options: SchemaOptions;
    data?: any;
    fetchOptions?: FetchOptions;
    typeOptions?: TypeOptions;
    beforeCreate?: (props: any) => void|Promise<void>;
    beforeCreateField?: BeforeCreateDynamicField;
    fieldHandler?: DynamicLayoutFieldHandler;
}

export interface DynamicLayoutFieldExtraData extends DynamicField {
    index: number;
}

export type DynamicLayoutFieldHandler<T = undefined> = DynamicFieldHandler<
    DynamicFieldOptions,
    DynamicFieldTypeOptions,
    DynamicLayoutFieldExtraData & T
    >


export interface DynamicLayoutEventListeners<FetchOptions = DynamicLayoutFetchOptions> {
    init: (options: FetchOptions, layoutName?: string, layoutIndex?: number) => void|Promise<void>;
    fetch: (options: FetchOptions,
             changedOptions: Partial<FetchOptions>,
             layoutName?: string, layoutIndex?: number) => void|Promise<void>;
    select: (selectIndex: number[], layoutName?: string, layoutIndex?: number) => void|Promise<void>;
    export: (options: FetchOptions, fields: DynamicField[], layoutName?: string, layoutIndex?: number) => void|Promise<void>;
}
