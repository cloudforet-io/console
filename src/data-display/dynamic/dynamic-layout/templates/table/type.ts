import {
    DynamicLayoutEventListeners, DynamicLayoutTypeOptions,
    DynamicLayoutFetchOptions,
    DynamicLayoutProps,
} from '@/data-display/dynamic/dynamic-layout/type';
import { TableOptions } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';


export type TableFetchOptions = Pick<DynamicLayoutFetchOptions,
    'sortBy'|'sortDesc'|'pageStart'|'pageLimit'|'searchText'
    >

export type TableTypeOptions = Pick<DynamicLayoutTypeOptions,
    'loading'|'totalCount'|'timezone'|'selectIndex'|'selectable'|'colCopy'|'searchable'|'excelVisible'
    >

export type TableDynamicLayoutProps = DynamicLayoutProps <
    TableOptions,
    TableFetchOptions,
    TableTypeOptions
    >

export type TableEventListeners
    = DynamicLayoutEventListeners<TableFetchOptions>;
