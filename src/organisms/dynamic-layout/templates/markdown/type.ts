import { MarkdownOptions } from '@/organisms/dynamic-layout/type/layout-schema';
import {
    DynamicLayoutEventListeners,
    DynamicLayoutTypeOptions, DynamicLayoutFetchOptions,
    DynamicLayoutProps,
} from '@/organisms/dynamic-layout/type';

export type MarkdownFetchOptions = Pick<DynamicLayoutFetchOptions, never>

export type MarkdownTypeOptions = Pick<DynamicLayoutTypeOptions, 'language'>

export type MarkdownDynamicLayoutProps = DynamicLayoutProps<
    MarkdownOptions,
    MarkdownFetchOptions,
    MarkdownTypeOptions
    >

export type MarkdownDynamicLayoutEventListeners
    = Pick<DynamicLayoutEventListeners<MarkdownFetchOptions>, 'init'>;
