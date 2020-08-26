import { DynamicFieldProps, DynamicFieldTypeOptions } from '@/components/organisms/dynamic-field/type';
import { BadgeOptions } from '@/components/organisms/dynamic-field/type/field-schema';


export type BadgeTypeOptions = Pick<DynamicFieldTypeOptions, never>;

export type BadgeDynamicFieldProps = DynamicFieldProps<
    BadgeOptions,
    BadgeTypeOptions
    >
