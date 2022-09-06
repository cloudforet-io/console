import type { JsonSchema, InnerJsonSchema } from '@/inputs/forms/new-json-schema-form/type';

export const NUMERIC_TYPES = ['number', 'integer'];

export const refineValueByProperty = ({ type }: JsonSchema, val?: string) => {
    let dataValue: string|number|undefined;
    if (NUMERIC_TYPES.includes(type)) {
        dataValue = Number(val);
        if (Number.isNaN(dataValue)) dataValue = undefined;
    } else {
        dataValue = val?.trim() ?? '';
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

export const getInputTypeBySchemaProperty = (schemaProperty: InnerJsonSchema) => {
    if (schemaProperty.format === 'password') return 'password';
    if (schemaProperty.type === 'string') return 'text';
    if (NUMERIC_TYPES.includes(schemaProperty.type)) return 'number';
    return 'text';
};

export const getInputPlaceholderBySchemaProperty = (schemaProperty: InnerJsonSchema) => schemaProperty.examples?.[0] ?? '';
