import {
    ListOptions,
    DynamicLayoutOptions,
    DynamicLayoutProps,
    DynamicLayoutTemplateProps,
} from '@/components/organisms/dynamic-layout/type';

export type ListDynamicLayoutProps = DynamicLayoutTemplateProps<
    DynamicLayoutProps<any, DynamicLayoutOptions>,
    ListOptions
>
