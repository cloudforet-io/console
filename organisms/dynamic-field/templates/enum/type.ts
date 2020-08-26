import { DynamicFieldProps, DynamicFieldTypeOptions } from '@/components/organisms/dynamic-field/type';
import { EnumOptions } from '@/components/organisms/dynamic-field/type/field-schema';


export type EnumTypeOptions = Pick<DynamicFieldTypeOptions, 'typeOptionsMap'>;

export type EnumDynamicFieldProps = DynamicFieldProps<
    EnumOptions,
    EnumTypeOptions
    >
