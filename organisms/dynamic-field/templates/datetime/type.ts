import { DynamicFieldProps, DynamicFieldTypeOptions } from '@/components/organisms/dynamic-field/type';
import { DatetimeOptions } from '@/components/organisms/dynamic-field/type/field-schema';


export type DatetimeTypeOptions = Pick<DynamicFieldTypeOptions, 'timezone'>;

export type DatetimeDynamicFieldProps = DynamicFieldProps<
    DatetimeOptions,
    DatetimeTypeOptions
    >
