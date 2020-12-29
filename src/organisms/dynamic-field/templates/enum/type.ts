import { DynamicFieldProps, DynamicFieldTypeOptions } from '@/organisms/dynamic-field/type';
import { EnumOptions } from '@/organisms/dynamic-field/type/field-schema';


export type EnumTypeOptions = Pick<DynamicFieldTypeOptions, 'typeOptionsMap'>;

export type EnumDynamicFieldProps = DynamicFieldProps<
    EnumOptions,
    EnumTypeOptions
    >
