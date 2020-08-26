/** Props type for Dynamic field component */
import {
    DynamicField,
    DynamicFieldOptions,
    DynamicFieldType,
} from '@/components/organisms/dynamic-field/type/field-schema';

export interface DynamicFieldTypeOptions {
    timezone: string;
    typeOptionsMap: Record<string, DynamicFieldTypeOptions>;
}

export interface DynamicFieldProps<Options = DynamicFieldOptions, TypeOptions = DynamicFieldTypeOptions> {
    type: DynamicFieldType;
    options: Options;
    data: any;
    typeOptions?: Partial<TypeOptions>; // a set of typeOptions props for each component
    extraData?: DynamicField;
    beforeCreate?: BeforeCreateDynamicField<Options>;
    handler?: DynamicFieldHandler;
}

export interface DynamicFieldMutableProps<Options = DynamicFieldOptions, TypeOptions = DynamicFieldTypeOptions> {
    options: Options;
    data: any;
    typeOptions?: Partial<TypeOptions>; // a set of typeOptions props for each component
    extraData?: DynamicField;
}

export interface BeforeCreateDynamicField<Options = DynamicFieldOptions, TypeOptions = DynamicFieldTypeOptions> {
    (props: DynamicFieldMutableProps<Options, TypeOptions>): void|Promise<void>;
}

export interface DynamicFieldHandler<Options = DynamicFieldOptions, TypeOptions = DynamicFieldTypeOptions> {
    (props: DynamicFieldMutableProps<Options, TypeOptions>): DynamicFieldMutableProps;
}

// TODO
export interface DynamicFieldEventListeners {
    copy(): void;
}
