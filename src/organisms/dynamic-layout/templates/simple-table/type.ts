import {
    DynamicLayoutEventListeners, DynamicLayoutTypeOptions,
    DynamicLayoutFetchOptions,
    DynamicLayoutProps,
} from '@/organisms/dynamic-layout/type';
import { SimpleTableOptions } from '@/organisms/dynamic-layout/type/layout-schema';

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
