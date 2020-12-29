import {
    DynamicLayoutProps, DynamicLayoutFetchOptions, DynamicLayoutTypeOptions, DynamicLayoutEventListeners,
} from '@/organisms/dynamic-layout/type';
import { ListOptions } from '@/organisms/dynamic-layout/type/layout-schema';

type ListFetchOptions = Pick<DynamicLayoutFetchOptions, 'listMap'>

type ListTypeOptions = Pick<DynamicLayoutTypeOptions, 'listMap'>

export type ListDynamicLayoutProps = DynamicLayoutProps<
    ListOptions,
    ListFetchOptions,
    ListTypeOptions
    >

export type ListDynamicLayoutEventListeners = Partial<DynamicLayoutEventListeners>;
