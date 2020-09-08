# support view-type

## static type

- [x] text (default)
- [x] state
- [x] badge
- [x] datetime
- [x] dict
- [ ] image

## recursive type

- [x] list
- [x] enum

## passive type

- [ ] link


<br>
<br>

# Types

```typescript

/** Metadata schema types for Dynamic field */
export const DYNAMIC_FIELD_TYPE = ['text', 'badge', 'datetime', 'dict', 'state', 'enum', 'list']

export type DynamicFieldType = typeof DYNAMIC_FIELD_TYPE[number];

interface CommonOptions {
    link?: string;
    tooltip?: string;
    sortable?: boolean;
    sort_key?: string;
    width?: string;
}

interface BadgeOptions extends CommonOptions {
    outline_color?: string;
    shape?: string;
    background_color?: string;
    text_color?: string;
}

enum DATETIME_SOURCE_TYPE {
    iso8601 = 'iso8601',
    timestamp = 'timestamp'
}

interface DatetimeOptions extends CommonOptions {
    source_type: keyof typeof DATETIME_SOURCE_TYPE;
    source_format?: string;
    display_format?: string;
}

interface ListOptions extends CommonOptions {
    item?: DynamicField;
    sub_key?: string;
    delimiter?: string;
}

interface StateOptions extends CommonOptions {
    icon?: {
        image?: string;
        color?: string;
    };
    text_color?: string;
}

interface EnumOptions {
    [data: string]: Omit<DynamicField, 'key'|'name'>;
}

type DictOptions = CommonOptions

type TextOptions = CommonOptions


type DynamicFieldOptions =
    BadgeOptions | DatetimeOptions |
    DictOptions | EnumOptions |
    ListOptions | StateOptions | TextOptions


interface DynamicField {
    key: string;
    name: string;
    type: DynamicFieldType;
    options?: DynamicFieldOptions;
}

interface DynamicFieldTypeOptions {
    timezone: string;
    typeOptionsMap: Record<string, DynamicFieldTypeOptions>;
}

interface DynamicFieldProps<Options = DynamicFieldOptions, TypeOptions = DynamicFieldTypeOptions, ExtraData = any> {
    type: DynamicFieldType;
    options: Options;
    data: any;
    typeOptions?: Partial<TypeOptions>; // a set of typeOptions props for each component
    extraData?: ExtraData;
    beforeCreate?: BeforeCreateDynamicField<Options>;
    handler?: DynamicFieldHandler;
}

interface BeforeCreateDynamicField<
    Options = DynamicFieldOptions,
    TypeOptions = DynamicFieldTypeOptions,
    ExtraData = any> {
    (props: DynamicFieldProps<Options, TypeOptions, ExtraData>): void|Promise<void>;
}

interface DynamicFieldHandler<
    Options = DynamicFieldOptions,
    TypeOptions = DynamicFieldTypeOptions,
     ExtraData = any> {
    (props: DynamicFieldProps<Options, TypeOptions, ExtraData>): Partial<DynamicFieldProps>;
}

```
