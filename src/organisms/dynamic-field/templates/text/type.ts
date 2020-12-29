import { DynamicFieldProps, DynamicFieldTypeOptions } from '@/organisms/dynamic-field/type';
import { TextOptions } from '@/organisms/dynamic-field/type/field-schema';


export type TextTypeOptions = Pick<DynamicFieldTypeOptions, never>;

export type TextDynamicFieldProps = DynamicFieldProps<
    TextOptions,
    TextTypeOptions
    >
