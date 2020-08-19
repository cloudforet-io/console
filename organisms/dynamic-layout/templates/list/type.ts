import {
    DynamicLayoutProps, DynamicLayoutFetchOptions, DynamicLayoutExtra, DynamicLayoutEventListeners,
} from '@/components/organisms/dynamic-layout/type';
import { ListOptions } from '@/components/organisms/dynamic-layout/type/layout-schema';

type ListFetchOptions = Pick<DynamicLayoutFetchOptions, 'listMap'>

type ListExtra = Pick<DynamicLayoutExtra, 'listMap'>

export type ListDynamicLayoutProps = DynamicLayoutProps<
    ListOptions,
    ListFetchOptions,
    ListExtra
    >

export type ListDynamicLayoutEventListeners = Partial<DynamicLayoutEventListeners>;
