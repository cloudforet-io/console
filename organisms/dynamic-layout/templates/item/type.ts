import { ItemOptions } from '@/components/organisms/dynamic-layout/type/layout-schema';
import {
    DynamicLayoutProps,
    DynamicLayoutEventListeners,
    DynamicLayoutFetchOptions, DynamicLayoutExtra
} from "@/components/organisms/dynamic-layout/type";

export type ItemFetchOptions = Pick<DynamicLayoutFetchOptions, never>;

export type ItemExtra = Pick<DynamicLayoutExtra, 'loading'|'timezone'>;

export type ItemDynamicLayoutProps = DynamicLayoutProps<
    ItemOptions,
    ItemFetchOptions,
    ItemExtra
    >

export type ItemDynamicLayoutEventListeners
    = Pick<DynamicLayoutEventListeners<ItemFetchOptions>, 'init'>;
