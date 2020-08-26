import {
    DynamicLayoutEventListeners, DynamicLayoutTypeOptions,
    DynamicLayoutFetchOptions,
    DynamicLayoutProps,
} from '@/components/organisms/dynamic-layout/type';
import { SimpleTableOptions } from '@/components/organisms/dynamic-layout/type/layout-schema';

export type SimpleTableFetchOptions = Pick<DynamicLayoutFetchOptions, never>

export type SimpleTableTypeOptions = Pick<DynamicLayoutTypeOptions,
    'loading'|'totalCount'|'timezone'
    >
export type SimpleTableDynamicLayoutProps = DynamicLayoutProps<
    SimpleTableOptions,
    SimpleTableFetchOptions,
    SimpleTableTypeOptions
    >

export type SimpleTableDynamicLayoutEventListeners
    = Pick<DynamicLayoutEventListeners<SimpleTableFetchOptions>, 'init'>;
