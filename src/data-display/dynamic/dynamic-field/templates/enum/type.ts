import { DynamicFieldProps, DynamicFieldTypeOptions } from '@/data-display/dynamic/dynamic-field/type';
import { EnumOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';


export type EnumTypeOptions = DynamicFieldTypeOptions;

export type EnumDynamicFieldProps = DynamicFieldProps<
    EnumOptions,
    EnumTypeOptions
    >
