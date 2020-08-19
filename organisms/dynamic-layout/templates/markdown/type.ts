import { MarkdownOptions } from '@/components/organisms/dynamic-layout/type/layout-schema';
import {
    DynamicLayoutEventListeners,
    DynamicLayoutExtra, DynamicLayoutFetchOptions,
    DynamicLayoutProps,
} from '@/components/organisms/dynamic-layout/type';

export type MarkdownFetchOptions = Pick<DynamicLayoutFetchOptions, never>

export type MarkdownExtra = Pick<DynamicLayoutExtra, 'language'>

export type MarkdownDynamicLayoutProps = DynamicLayoutProps<
    MarkdownOptions,
    MarkdownFetchOptions,
    MarkdownExtra
    >

export type MarkdownDynamicLayoutEventListeners
    = Pick<DynamicLayoutEventListeners<MarkdownFetchOptions>, 'init'>;
