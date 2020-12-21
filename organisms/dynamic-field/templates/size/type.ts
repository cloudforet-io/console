import { DynamicFieldProps, DynamicFieldTypeOptions } from '@/components/organisms/dynamic-field/type';
import { SizeOptions } from '@/components/organisms/dynamic-field/type/field-schema';


export type SizeTypeOptions = Pick<DynamicFieldTypeOptions, never>;

export type SizeDynamicFieldProps = DynamicFieldProps<
    SizeOptions,
    SizeTypeOptions
    >
