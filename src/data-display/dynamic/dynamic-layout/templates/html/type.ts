import {
    DynamicLayoutEventListeners, DynamicLayoutTypeOptions,
    DynamicLayoutFetchOptions,
    DynamicLayoutProps,
} from '@/data-display/dynamic/dynamic-layout/type';
import { HtmlOptions } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';

export type HtmlFetchOptions = Pick<DynamicLayoutFetchOptions, never>;
export type HtmlTypeOptions = Pick<DynamicLayoutTypeOptions, never>;

export type HtmlDynamicLayoutProps = DynamicLayoutProps<
    HtmlOptions,
    HtmlFetchOptions,
    HtmlTypeOptions
    >

export type HtmlEventListeners
    = Pick<DynamicLayoutEventListeners<HtmlFetchOptions>, 'init'>;
