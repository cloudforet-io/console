import { DynamicLayoutTemplateProps, MarkdownOptions } from '@/components/organisms/dynamic-layout/type';
import { MarkdownProps } from '@/components/molecules/markdown/type';

export type MarkdownDynamicLayoutProps = DynamicLayoutTemplateProps<
    Partial<MarkdownProps>,
    MarkdownOptions
    >
