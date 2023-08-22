import type {
    DynamicFieldHandler,
    DynamicFieldTypeOptions,
} from '@/data-display/dynamic/dynamic-field/type';
import type { DynamicField, DynamicFieldOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import type { DynamicLayoutOptions, DynamicLayoutType } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';
import type { KeyItemSet, ValueHandlerMap } from '@/inputs/search/query-search/type';
import type { QueryTag } from '@/inputs/search/query-search-tags/type';


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
    multiSelect?: boolean;
    invalid?: boolean;
    excelVisible?: boolean;
    settingsVisible?: boolean;
    keyItemSets?: KeyItemSet[];
    valueHandlerMap?: ValueHandlerMap;
    language?: string;
    popupVisible?: boolean;
    sortable?: boolean;
}

export interface DynamicLayoutProps<
    SchemaOptions = DynamicLayoutOptions,
    > {
    name?: string;
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

export type DynamicLayoutFieldHandler<T = any> = DynamicFieldHandler<
    DynamicFieldOptions,
    DynamicFieldTypeOptions,
    DynamicLayoutFieldExtraData & T
    >;


export interface DynamicLayoutEventListener {
    fetch: (options: DynamicLayoutFetchOptions, layoutName?: string, layoutIndex?: number) => void|Promise<void>;
    select: (selectIndex: number[], layoutName?: string, layoutIndex?: number) => void|Promise<void>;
    export: (layoutName?: string, layoutIndex?: number) => void|Promise<void>;
    'click-settings': (layoutName?: string, layoutIndex?: number) => void|Promise<void>;
    'click-row': (selectIndex: number[]) => void|Promise<void>;
}
