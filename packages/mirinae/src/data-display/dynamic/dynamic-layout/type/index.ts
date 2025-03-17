import type { QueryTag } from '@/controls/search/query-search-tags/type';
import type { KeyItemSet, ValueHandlerMap } from '@/controls/search/query-search/type';
import type {
    DynamicFieldHandler,
    DynamicFieldTypeOptions,
} from '@/data-display/dynamic/dynamic-field/type';
import type { DynamicField, DynamicFieldOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import type { DynamicLayoutOptions, DynamicLayoutType } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';


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

// NOTE: Due to the version issue of mirinae vue, it is not possible to define a type with generics using defineProps, so DynamicLayoutBaseProps is added and used.
export interface DynamicLayoutBaseProps {
    name: string;
    type: DynamicLayoutType;
    data?: any;
    fetchOptions?: DynamicLayoutFetchOptions;
    typeOptions?: DynamicLayoutTypeOptions;
    fieldHandler?: DynamicLayoutFieldHandler;
}

export interface DynamicLayoutProps<
    SchemaOptions = DynamicLayoutOptions,
    > extends DynamicLayoutBaseProps {
    options: SchemaOptions;
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
