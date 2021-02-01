import {
    DynamicLayoutEventListeners, DynamicLayoutTypeOptions,
    DynamicLayoutFetchOptions,
    DynamicLayoutProps,
} from '@/data-display/dynamic/dynamic-layout/type';
import { RawOptions } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';

export type RawFetchOptions = Pick<DynamicLayoutFetchOptions, never>;
export type RawTypeOptions = Pick<DynamicLayoutTypeOptions, 'loading'>;

export type RawDynamicLayoutProps = DynamicLayoutProps<
    RawOptions,
    RawFetchOptions,
    RawTypeOptions
    >

export type RawEventListeners
    = Pick<DynamicLayoutEventListeners<RawFetchOptions>, 'init'>;
