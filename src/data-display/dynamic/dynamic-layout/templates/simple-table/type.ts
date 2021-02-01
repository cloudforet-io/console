import {
    DynamicLayoutEventListeners, DynamicLayoutTypeOptions,
    DynamicLayoutFetchOptions,
    DynamicLayoutProps,
} from '@/data-display/dynamic/dynamic-layout/type';
import { SimpleTableOptions } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';

export type SimpleTableFetchOptions = Pick<DynamicLayoutFetchOptions, never>

export type SimpleTableTypeOptions = Pick<DynamicLayoutTypeOptions,
    'loading'|'timezone'|'colCopy'
    >
export type SimpleTableDynamicLayoutProps = DynamicLayoutProps<
    SimpleTableOptions,
    SimpleTableFetchOptions,
    SimpleTableTypeOptions
    >

export type SimpleTableEventListeners
    = Pick<DynamicLayoutEventListeners<SimpleTableFetchOptions>, 'init'>;
