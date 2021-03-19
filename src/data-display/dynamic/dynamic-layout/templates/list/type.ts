import {
    DynamicLayoutProps, DynamicLayoutFetchOptions, DynamicLayoutTypeOptions, DynamicLayoutEventListeners,
} from '@/data-display/dynamic/dynamic-layout/type';
import { ListOptions } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';

type ListFetchOptions = DynamicLayoutFetchOptions

type ListTypeOptions = DynamicLayoutTypeOptions

export type ListDynamicLayoutProps = DynamicLayoutProps<
    ListOptions,
    ListFetchOptions,
    ListTypeOptions
    >

export type ListDynamicLayoutEventListeners = Partial<DynamicLayoutEventListeners>;
