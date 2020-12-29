import {
    DynamicLayoutEventListeners, DynamicLayoutTypeOptions,
    DynamicLayoutFetchOptions,
    DynamicLayoutProps,
} from '@/organisms/dynamic-layout/type';
import { RawOptions } from '@/organisms/dynamic-layout/type/layout-schema';

export type RawFetchOptions = Pick<DynamicLayoutFetchOptions, never>;
export type RawTypeOptions = Pick<DynamicLayoutTypeOptions, 'loading'>;

export type RawDynamicLayoutProps = DynamicLayoutProps<
    RawOptions,
    RawFetchOptions,
    RawTypeOptions
    >

export type RawEventListeners
    = Pick<DynamicLayoutEventListeners<RawFetchOptions>, 'init'>;
