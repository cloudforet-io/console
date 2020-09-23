import {
    DynamicLayoutEventListeners, DynamicLayoutTypeOptions,
    DynamicLayoutFetchOptions,
    DynamicLayoutProps,
} from '@/components/organisms/dynamic-layout/type';
import { RawOptions } from '@/components/organisms/dynamic-layout/type/layout-schema';

export type RawFetchOptions = Pick<DynamicLayoutFetchOptions, never>;
export type RawTypeOptions = Pick<DynamicLayoutTypeOptions, 'loading'>;

export type RawDynamicLayoutProps = DynamicLayoutProps<
    RawOptions,
    RawFetchOptions,
    RawTypeOptions
    >

export type RawDynamicLayoutEventListeners
    = Pick<DynamicLayoutEventListeners<RawFetchOptions>, 'init'>;
