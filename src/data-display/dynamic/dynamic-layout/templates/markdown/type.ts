import { MarkdownOptions } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';
import {
    DynamicLayoutEventListeners,
    DynamicLayoutTypeOptions, DynamicLayoutFetchOptions,
    DynamicLayoutProps,
} from '@/data-display/dynamic/dynamic-layout/type';

export type MarkdownFetchOptions = Pick<DynamicLayoutFetchOptions, never>

export type MarkdownTypeOptions = Pick<DynamicLayoutTypeOptions, 'language'>

export type MarkdownDynamicLayoutProps = DynamicLayoutProps<
    MarkdownOptions,
    MarkdownFetchOptions,
    MarkdownTypeOptions
    >

export type MarkdownDynamicLayoutEventListeners
    = Pick<DynamicLayoutEventListeners<MarkdownFetchOptions>, 'init'>;
