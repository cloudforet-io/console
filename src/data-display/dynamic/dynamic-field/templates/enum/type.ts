import { DynamicFieldProps, DynamicFieldTypeOptions } from '@/data-display/dynamic/dynamic-field/type';
import { EnumOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';


export type EnumTypeOptions = Pick<DynamicFieldTypeOptions, 'typeOptionsMap'>;

export type EnumDynamicFieldProps = DynamicFieldProps<
    EnumOptions,
    EnumTypeOptions
    >
