import { ItemOptions } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';
import {
    DynamicLayoutProps,
    DynamicLayoutFetchOptions,
} from '@/data-display/dynamic/dynamic-layout/type';

export type ItemFetchOptions = Pick<DynamicLayoutFetchOptions, never>;


export type ItemDynamicLayoutProps = DynamicLayoutProps<ItemOptions>
