import { DynamicFieldProps, DynamicFieldTypeOptions } from '@/components/organisms/dynamic-field/type';
import { TextOptions } from '@/components/organisms/dynamic-field/type/field-schema';


export type TextTypeOptions = Pick<DynamicFieldTypeOptions, never>;

export type TextDynamicFieldProps = DynamicFieldProps<
    TextOptions,
    TextTypeOptions
    >
