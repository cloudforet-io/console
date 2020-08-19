import {
    DynamicLayoutEventListeners, DynamicLayoutExtra,
    DynamicLayoutFetchOptions,
    DynamicLayoutProps,
} from '@/components/organisms/dynamic-layout/type';
import { SimpleTableOptions } from '@/components/organisms/dynamic-layout/type/layout-schema';

export type SimpleTableFetchOptions = Pick<DynamicLayoutFetchOptions, never>

export type SimpleTableExtra = Pick<DynamicLayoutExtra,
    'loading'|'totalCount'|'timezone'
    >
export type SimpleTableDynamicLayoutProps = DynamicLayoutProps<
    SimpleTableOptions,
    SimpleTableFetchOptions,
    SimpleTableExtra
    >

export type SimpleTableDynamicLayoutEventListeners
    = Pick<DynamicLayoutEventListeners<SimpleTableFetchOptions>, 'init'>;
