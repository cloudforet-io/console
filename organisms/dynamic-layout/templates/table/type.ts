import {
    DynamicLayoutEventListeners, DynamicLayoutExtra,
    DynamicLayoutFetchOptions,
    DynamicLayoutProps,
} from '@/components/organisms/dynamic-layout/type';
import { TableOptions } from '@/components/organisms/dynamic-layout/type/layout-schema';


export type TableFetchOptions = Pick<DynamicLayoutFetchOptions,
    'sortBy'|'sortDesc'|'pageStart'|'pageLimit'|'searchText'
    >

export type TableExtra = Pick<DynamicLayoutExtra,
    'loading'|'totalCount'|'timezone'|'selectIndex'
    >

export type TableDynamicLayoutProps = DynamicLayoutProps <
    TableOptions,
    TableFetchOptions,
    TableExtra
    >

export type TableDynamicLayoutEventListeners
    = DynamicLayoutEventListeners<TableFetchOptions>;
