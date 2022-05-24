import {
    DynamicLayoutProps,
    DynamicLayoutFetchOptions,
} from '@/data-display/dynamic/dynamic-layout/type';
import { ItemOptions } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';

export type ItemFetchOptions = Pick<DynamicLayoutFetchOptions, never>;


export type ItemDynamicLayoutProps = DynamicLayoutProps<ItemOptions>
