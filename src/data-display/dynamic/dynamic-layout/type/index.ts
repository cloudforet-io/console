import { DynamicLayoutOptions, DynamicLayoutType } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';
import { QueryTag } from '@/inputs/search/query-search-tags/type';
import { KeyItemSet, ValueHandlerMap } from '@/inputs/search/query-search/type';
import {
    DynamicFieldHandler,
    DynamicFieldTypeOptions,
} from '@/data-display/dynamic/dynamic-field/type';
import { DynamicField, DynamicFieldOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';


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
    loading?: boolean;
    totalCount?: number;
    timezone?: string;
    selectIndex?: number[];
    selectable?: boolean;
    colCopy?: boolean;
    searchable?: boolean;
    multiSelect?: boolean;
    invalid?: boolean;
    excelVisible?: boolean;
    keyItemSets?: KeyItemSet[];
    valueHandlerMap?: ValueHandlerMap;
    language?: string;
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
