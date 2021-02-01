import { DynamicFieldProps, DynamicFieldTypeOptions } from '@/data-display/dynamic/dynamic-field/type';
import { BadgeOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';


export type BadgeTypeOptions = Pick<DynamicFieldTypeOptions, never>;

export type BadgeDynamicFieldProps = DynamicFieldProps<
    BadgeOptions,
    BadgeTypeOptions
    >
