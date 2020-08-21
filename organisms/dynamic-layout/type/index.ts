import { DynamicLayoutOptions, DynamicLayoutType } from '@/components/organisms/dynamic-layout/type/layout-schema';
import { QueryTag } from '@/components/organisms/search/query-search-tags/PQuerySearchTags.toolset';
import { KeyItem, ValueHandlerMap } from '@/components/organisms/search/query-search/type';


export interface DynamicLayoutFetchOptions {
    sortBy: string;
    sortDesc: boolean;
    pageStart: number;
    pageLimit: number;
    queryTags: QueryTag[];
    searchText: string;
    listMap: Record<string, Partial<DynamicLayoutFetchOptions>>;
}

export interface DynamicLayoutExtra {
    loading: boolean;
    totalCount: number;
    timezone: string;
    selectIndex: number[];
    keyItems: KeyItem[];
    valueHandlerMap: ValueHandlerMap;
    language: string;
    listMap: Record<string, Partial<DynamicLayoutExtra>>;
}

export interface DynamicLayoutProps<
    SchemaOptions = DynamicLayoutOptions,
        FetchOptions = DynamicLayoutFetchOptions,
    Extra = DynamicLayoutExtra
    > {
    name: string;
    type: DynamicLayoutType;
    options: SchemaOptions;
    data?: any;
    beforeCreate?: (props: any) => void|Promise<void>;
    fetchOptions?: FetchOptions;
    extra?: Extra;
}


export interface DynamicLayoutEventListeners<FetchOptions = DynamicLayoutFetchOptions> {
    init: (options: FetchOptions, layoutName?: string, layoutIndex?: number) => void|Promise<void>;
    fetch: (options: FetchOptions,
             changedOptions: Partial<FetchOptions>,
             layoutName?: string, layoutIndex?: number) => void|Promise<void>;
    select: (selectIndex: number[], layoutName?: string, layoutIndex?: number) => void|Promise<void>;
}
