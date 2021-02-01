import {
    DynamicLayoutEventListeners, DynamicLayoutTypeOptions,
    DynamicLayoutFetchOptions,
    DynamicLayoutProps,
} from '@/data-display/dynamic/dynamic-layout/type';
import { RawTableOptions } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';

export type RawTableFetchOptions = Pick<DynamicLayoutFetchOptions,
    'sortBy'|'sortDesc'|'pageStart'|'pageLimit'|'searchText'
    >

export type RawTableTypeOptions = Pick<DynamicLayoutTypeOptions,
    'loading'|'totalCount'|'timezone'|'selectIndex'|'selectable'|'colCopy'
    >
export type RawTableDynamicLayoutProps = DynamicLayoutProps<
    RawTableOptions,
    RawTableFetchOptions,
    RawTableTypeOptions
    >

export type RawTableEventListeners
    = DynamicLayoutEventListeners<RawTableFetchOptions>;
