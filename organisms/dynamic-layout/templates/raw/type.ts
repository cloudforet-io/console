import { DynamicLayoutTemplateProps, RawOptions } from '@/components/organisms/dynamic-layout/type';
import { RawDataProps } from '@/components/organisms/text-editor/raw-data/type';

export type RawDynamicLayoutProps = DynamicLayoutTemplateProps<
        Partial<RawDataProps>,
        RawOptions
    >
