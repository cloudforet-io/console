import type { DynamicFieldProps, DynamicFieldTypeOptions } from '@/data-display/dynamic/dynamic-field/type';
import type { SizeOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';


export type SizeTypeOptions = Pick<DynamicFieldTypeOptions, never>;

export type SizeDynamicFieldProps = DynamicFieldProps<
    SizeOptions,
    SizeTypeOptions
    >;
