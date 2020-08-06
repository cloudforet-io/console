import {
    ListOptions,
    DynamicLayoutOptions,
    DynamicLayoutProps,
    DynamicLayoutTemplateProps,
} from '@/components/organisms/dynamic-layout/type';

export type ListDynamicLayoutProps<T=any> = DynamicLayoutTemplateProps<
    DynamicLayoutProps<any, DynamicLayoutOptions, T>,
    ListOptions,
    T
>
