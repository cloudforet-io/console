import type { JsonSchema } from '@/inputs/forms/json-schema-form/type';

const initJsonDataObjectWithSchema = (schema?: JsonSchema, formData?: object): object => {
    const { properties } = schema ?? {};
    if (!properties) return {};
    const result = {};
    Object.keys(properties).forEach((key) => {
        const property = properties[key];
        result[key] = formData?.[key] ?? property.default ?? undefined;
    });
    return result;
};
export const initJsonInputDataWithSchema = (schema?: JsonSchema, formData?: object): string|undefined => {
    if (formData === null || formData === undefined) return undefined;
    try {
        return JSON.stringify(initJsonDataObjectWithSchema(schema, formData), undefined, 2);
    } catch (e) {
        return undefined;
    }
};
