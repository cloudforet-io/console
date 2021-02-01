/** Props type for Dynamic field component */
import {
    DynamicField,
    DynamicFieldOptions,
    DynamicFieldType,
} from '@/data-display/dynamic/dynamic-field/type/field-schema';

export interface DynamicFieldTypeOptions {
    timezone: string;
    typeOptionsMap: Record<string, DynamicFieldTypeOptions>;
}

export interface DynamicFieldProps<Options = DynamicFieldOptions, TypeOptions = DynamicFieldTypeOptions, ExtraData = any> {
    type: DynamicFieldType;
    options: Options;
    data: any;
    typeOptions?: Partial<TypeOptions>; // a set of typeOptions props for each component
    extraData?: ExtraData;
    beforeCreate?: BeforeCreateDynamicField<Options>;
    handler?: DynamicFieldHandler;
}

export interface BeforeCreateDynamicField<
    Options = DynamicFieldOptions,
    TypeOptions = DynamicFieldTypeOptions,
    ExtraData = any> {
    (props: DynamicFieldProps<Options, TypeOptions, ExtraData>): void|Promise<void>;
}

export interface DynamicFieldHandler<
    Options = DynamicFieldOptions,
    TypeOptions = DynamicFieldTypeOptions,
     ExtraData = any> {
    (props: DynamicFieldProps<Options, TypeOptions, ExtraData>): Partial<DynamicFieldProps>;
}

// TODO
export interface DynamicFieldEventListeners {
    copy(): void;
}
