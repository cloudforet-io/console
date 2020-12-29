import { DynamicFieldProps, DynamicFieldTypeOptions } from '@/organisms/dynamic-field/type';
import { SizeOptions } from '@/organisms/dynamic-field/type/field-schema';


export type SizeTypeOptions = Pick<DynamicFieldTypeOptions, never>;

export type SizeDynamicFieldProps = DynamicFieldProps<
    SizeOptions,
    SizeTypeOptions
    >
