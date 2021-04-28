import { DynamicLayoutOptions, DynamicLayoutType } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';
import { QueryTag } from '@/inputs/search/query-search-tags/type';
import { KeyItemSet, ValueHandlerMap } from '@/inputs/search/query-search/type';
import {
    DynamicFieldHandler,
    DynamicFieldTypeOptions,
} from '@/data-display/dynamic/dynamic-field/type';
import { DynamicField, DynamicFieldOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';


export interface DynamicLayoutFetchOptions {
    sortBy?: string;
    sortDesc?: boolean;
    pageStart?: number;
    pageLimit?: number;
    queryTags?: QueryTag[];
    searchText?: string;
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
    settingsVisible?: boolean;
    keyItemSets?: KeyItemSet[];
    valueHandlerMap?: ValueHandlerMap;
    language?: string;
}

export interface DynamicLayoutProps<
    SchemaOptions = DynamicLayoutOptions,
    > {
    name: string;
    type: DynamicLayoutType;
    options: SchemaOptions;
    data?: any;
    fetchOptions?: DynamicLayoutFetchOptions;
    typeOptions?: DynamicLayoutTypeOptions;
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


export interface DynamicLayoutEventListener {
    fetch: (options: DynamicLayoutFetchOptions, layoutName?: string, layoutIndex?: number) => void|Promise<void>;
    select: (selectIndex: number[], layoutName?: string, layoutIndex?: number) => void|Promise<void>;
    export: (layoutName?: string, layoutIndex?: number) => void|Promise<void>;
    'click-settings': (layoutName?: string, layoutIndex?: number) => void|Promise<void>;
}
