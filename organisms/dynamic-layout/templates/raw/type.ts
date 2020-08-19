import {
    DynamicLayoutEventListeners, DynamicLayoutExtra,
    DynamicLayoutFetchOptions,
    DynamicLayoutProps,
} from '@/components/organisms/dynamic-layout/type';
import { RawOptions } from '@/components/organisms/dynamic-layout/type/layout-schema';

export type RawFetchOptions = Pick<DynamicLayoutFetchOptions, never>;
export type RawExtra = Pick<DynamicLayoutExtra, never>;

export type RawDynamicLayoutProps = DynamicLayoutProps<
    RawOptions,
    RawFetchOptions,
    RawExtra
    >

export type RawDynamicLayoutEventListeners
    = Pick<DynamicLayoutEventListeners<RawFetchOptions>, 'init'>;
