import type {
    JsonSchema, InnerJsonSchema, ComponentName, TextInputType,
} from '@/inputs/forms/new-json-schema-form/type';

export const NUMERIC_TYPES = ['number', 'integer'];

export const refineValueByProperty = ({ type, format }: JsonSchema, val?: any) => {
    let dataValue: string|number|undefined;
    if (NUMERIC_TYPES.includes(type)) {
        if (val === undefined || val?.trim() === '') {
            dataValue = undefined;
        } else {
            dataValue = Number(val);
            if (Number.isNaN(dataValue)) dataValue = undefined;
        }
    } else if (format === 'json') {
        if (!val?.trim()) dataValue = undefined;
        else {
            try {
                const parsedData = JSON.parse(val);
                if (typeof parsedData === 'object') dataValue = parsedData;
                else dataValue = val;
            } catch (e) {
                dataValue = val;
            }
        }
    } else {
        dataValue = val?.trim() || undefined;
    }
    return dataValue;
};

export const initFormDataWithSchema = (schema?: JsonSchema, formData: object = {}): object => {
    const { properties } = schema ?? {};
    if (!properties) return {};

    const result = {};
    Object.keys(properties).forEach((key) => {
        const property = properties[key];
        result[key] = formData[key] ?? property.default ?? undefined;
    });
    return result;
};

export const getComponentNameBySchemaProperty = (schemaProperty: InnerJsonSchema): ComponentName => {
    if (schemaProperty.format === 'generate_id') return 'GenerateIdFormat';
    if (schemaProperty.format === 'json') return 'PTextEditor';
    return 'PTextInput';
};

export const getInputTypeBySchemaProperty = (schemaProperty: InnerJsonSchema): TextInputType => {
    if (schemaProperty.format === 'password') return 'password';
    if (schemaProperty.type === 'string') return 'text';
    if (NUMERIC_TYPES.includes(schemaProperty.type)) return 'number';
    return 'text';
};

export const getInputPlaceholderBySchemaProperty = (schemaProperty: InnerJsonSchema) => schemaProperty.examples?.[0] ?? '';
