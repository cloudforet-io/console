import {
    DynamicLayoutEventListeners, DynamicLayoutTypeOptions,
    DynamicLayoutFetchOptions,
    DynamicLayoutProps,
} from '@/components/organisms/dynamic-layout/type';
import { HtmlOptions } from '@/components/organisms/dynamic-layout/type/layout-schema';

export type HtmlFetchOptions = Pick<DynamicLayoutFetchOptions, never>;
export type HtmlTypeOptions = Pick<DynamicLayoutTypeOptions, never>;

export type HtmlDynamicLayoutProps = DynamicLayoutProps<
    HtmlOptions,
    HtmlFetchOptions,
    HtmlTypeOptions
    >

export type HtmlEventListeners
    = Pick<DynamicLayoutEventListeners<HtmlFetchOptions>, 'init'>;
