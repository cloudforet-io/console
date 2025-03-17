import type { JsonSchema } from '@/controls/forms/json-schema-form/type';

export const NUMERIC_TYPES = ['number', 'integer'];


const refineNumberTypeValue = (val: any): any => {
    if (typeof val === 'string' && val.trim() === '') {
        return undefined;
    }
    let dataValue: any = Number(val);
    if (Number.isNaN(dataValue)) dataValue = undefined;
    return dataValue;
};

const refineArrayTypeValue = (schema: JsonSchema, val?: any[]): string[] | undefined => {
    if (!val?.length) return undefined;
    if (typeof val[0] === 'string') return val;

    return val.map((d) => d.name); // Get data from each item's name property. This is the spec of PFilterableDropdown and PTextInput's selected prop
};

export const refineValueByProperty = (schema: JsonSchema, val?: any): any => {
    const { type, disabled } = schema;
    if (disabled) return schema?.default ?? undefined;
    if (type === 'object') return val; // In case of object, child JsonSchemaForm refines the data.
    if (type === 'array') return refineArrayTypeValue(schema, val);
    if (type && NUMERIC_TYPES.includes(type)) return refineNumberTypeValue(val);
    if (type === 'string') {
        // PFilterableDropdown, PSelectDropdown case (string, single select)
        if (Array.isArray(val)) {
            return val[0]?.name;
        } if (typeof val === 'object') {
            return val.name;
        }
    }
    if (typeof val === 'string') return val?.trim() || undefined;
    if (typeof val === 'boolean') return val;
    return undefined;
};



export const refineObjectByProperties = (schema: JsonSchema, formData: object): object => {
    const { properties } = schema ?? {};
    if (!properties) return formData;
    const result = {};
    Object.keys(properties).forEach((key) => {
        result[key] = formData[key];
    });
    return result;
};

export const initRefinedFormData = (schema?: JsonSchema, rawFormData?: any, isRoot?: boolean): any => {
    if (typeof rawFormData !== 'object' || Array.isArray(rawFormData)) {
        if (isRoot) {
            console.error(new Error('[JsonSchemaForm] Only object is available for formData prop'));
            return {};
        }
        return rawFormData;
    }

    const { properties } = schema ?? {};
    const result = {};
    if (!properties) return rawFormData;
    Object.keys(properties).forEach((key) => {
        const property = properties[key];
        result[key] = refineValueByProperty(property, rawFormData?.[key] ?? property.default);
    });
    return result;
};
