import {
    DynamicLayoutEventListeners, DynamicLayoutTypeOptions, DynamicLayoutFetchOptions,
    DynamicLayoutProps,
} from '@/components/organisms/dynamic-layout/type';
import { QuerySearchTableOptions } from '@/components/organisms/dynamic-layout/type/layout-schema';

export type QuerySearchTableFetchOptions = Pick<DynamicLayoutFetchOptions,
'sortBy'|'sortDesc'|'pageStart'|'pageLimit'|'queryTags'
    >

export type QuerySearchTableTypeOptions = Pick<DynamicLayoutTypeOptions,
    'loading'|'totalCount'|'timezone'|'selectIndex'|'selectable'|'keyItems'|'valueHandlerMap'
    >

export type QuerySearchTableDynamicLayoutProps = DynamicLayoutProps<
    QuerySearchTableOptions,
    QuerySearchTableFetchOptions,
    QuerySearchTableTypeOptions
    >

export type QuerySearchTableListeners
    = DynamicLayoutEventListeners<QuerySearchTableFetchOptions>
