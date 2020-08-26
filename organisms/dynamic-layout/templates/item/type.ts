import { ItemOptions } from '@/components/organisms/dynamic-layout/type/layout-schema';
import {
    DynamicLayoutProps,
    DynamicLayoutEventListeners,
    DynamicLayoutFetchOptions, DynamicLayoutTypeOptions,
} from '@/components/organisms/dynamic-layout/type';

export type ItemFetchOptions = Pick<DynamicLayoutFetchOptions, never>;

export type ItemTypeOptions = Pick<DynamicLayoutTypeOptions, 'loading'|'timezone'>;

export type ItemDynamicLayoutProps = DynamicLayoutProps<
    ItemOptions,
    ItemFetchOptions,
    ItemTypeOptions
    >

export type ItemDynamicLayoutEventListeners
    = Pick<DynamicLayoutEventListeners<ItemFetchOptions>, 'init'>;
