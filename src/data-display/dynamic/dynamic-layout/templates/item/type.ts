import { ItemOptions } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';
import {
    DynamicLayoutProps,
    DynamicLayoutEventListeners,
    DynamicLayoutFetchOptions, DynamicLayoutTypeOptions,
} from '@/data-display/dynamic/dynamic-layout/type';

export type ItemFetchOptions = Pick<DynamicLayoutFetchOptions, never>;

export type ItemTypeOptions = Pick<DynamicLayoutTypeOptions, 'loading'|'timezone'>;

export type ItemDynamicLayoutProps = DynamicLayoutProps<
    ItemOptions,
    ItemFetchOptions,
    ItemTypeOptions
    >

export type ItemDynamicLayoutEventListeners
    = Pick<DynamicLayoutEventListeners<ItemFetchOptions>, 'init'>;
