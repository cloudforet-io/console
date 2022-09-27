import type { SelectDropdownMenu } from '@/inputs/dropdown/select-dropdown/type';
import type {
    JsonSchema, InnerJsonSchema, ComponentName, TextInputType,
} from '@/inputs/forms/new-json-schema-form/type';

export const NUMERIC_TYPES = ['number', 'integer'];

export type RawValue = string|number|SelectDropdownMenu[]|undefined
export type RefinedValue = string|number|undefined;

const refineNumberTypeValue = (val: RawValue): RefinedValue => {
    if (typeof val === 'string' && val.trim() === '') {
        return undefined;
    }
    let dataValue: RefinedValue = Number(val);
    if (Number.isNaN(dataValue)) dataValue = undefined;
    return dataValue;
};

const refineJsonFormatValue = (val: RawValue): RefinedValue => {
    if (typeof val !== 'string' || val.trim() === '') return undefined;

    try {
        const parsedData = JSON.parse(val);
        if (typeof parsedData === 'object') return parsedData;
        return val;
    } catch (e) {
        return val;
    }
};

export const refineValueByProperty = ({ type, format, disabled }: JsonSchema, val?: RawValue): RefinedValue => {
    if (disabled) return undefined;
    if (NUMERIC_TYPES.includes(type)) return refineNumberTypeValue(val);
    if (format === 'json') return refineJsonFormatValue(val);
    if (typeof val === 'string') return val?.trim() || undefined;
    return undefined;
};

export const initFormDataWithSchema = (schema?: JsonSchema, formData: object = {}, refine?: boolean): object => {
    const { properties } = schema ?? {};
    if (!properties) return {};

    const result = {};
    Object.keys(properties).forEach((key) => {
        const property = properties[key];

        if (refine) result[key] = refineValueByProperty(property, property.default);
        else result[key] = formData[key] ?? property.default ?? undefined;
    });
    return result;
};

export const getComponentNameBySchemaProperty = (schemaProperty: InnerJsonSchema): ComponentName => {
    if (schemaProperty.format === 'generate_id') return 'GenerateIdFormat';
    if (schemaProperty.format === 'json') return 'PTextEditor';
    if (Array.isArray(schemaProperty.enum) && schemaProperty.type === 'string') return 'PSelectDropdown';
    return 'PTextInput';
};

export const getInputTypeBySchemaProperty = (schemaProperty: InnerJsonSchema): TextInputType => {
    if (schemaProperty.format === 'password') return 'password';
    if (schemaProperty.type === 'string') return 'text';
    if (NUMERIC_TYPES.includes(schemaProperty.type)) return 'number';
    return 'text';
};

export const getInputPlaceholderBySchemaProperty = (schemaProperty: InnerJsonSchema) => schemaProperty.examples?.[0] ?? '';

export const getMenuItemsBySchemaProperty = (schemaProperty: InnerJsonSchema): SelectDropdownMenu[]|undefined => {
    if (Array.isArray(schemaProperty.enum)) {
        try {
            return schemaProperty.enum.map((d) => {
                if (typeof d === 'string') {
                    return { name: d, label: d };
                }

                throw new Error('Invalid enum value');
            });
        } catch (e: unknown) {
            console.error(e);
            return undefined;
        }
    }
    return undefined;
};
