import type { SelectDropdownMenu } from '@/inputs/dropdown/select-dropdown/type';
import type {
    ComponentName, InnerJsonSchema, JsonSchema, TextInputType,
} from '@/inputs/forms/json-schema-form/type';

export const NUMERIC_TYPES = ['number', 'integer'];


const refineNumberTypeValue = (val: any): any => {
    if (typeof val === 'string' && val.trim() === '') {
        return undefined;
    }
    let dataValue: any = Number(val);
    if (Number.isNaN(dataValue)) dataValue = undefined;
    return dataValue;
};

const refineArrayTypeValue = (val?: any[], prefixItems?: any[]): string[] | undefined => {
    if (!val?.length) return undefined;
    if (typeof val[0] === 'string') return val;

    if (prefixItems?.length) return val.map(d => d.name);
    return val.map(d => d.value);
};

export const refineValueByProperty = (schema: JsonSchema, val?: any): any => {
    const { type, disabled } = schema;
    if (disabled) return undefined;
    if (type === 'object') return val; // In case of object, child JsonSchemaForm refines the data.
    if (type === 'array') return refineArrayTypeValue(val, schema.prefixItems);
    if (NUMERIC_TYPES.includes(type)) return refineNumberTypeValue(val);
    if (typeof val === 'string') return val?.trim() || undefined;
    return undefined;
};

export const initFormDataWithSchema = (schema?: JsonSchema, formData?: object): object => {
    const { properties } = schema ?? {};

    const result = {};
    if (!properties) return {};
    Object.keys(properties).forEach((key) => {
        const property = properties[key];
        result[key] = formData?.[key] ?? property.default ?? undefined;
        if (property.type === 'array' && result[key]) { // array type needs conversion for component.
            if (!Array.isArray(result[key])) {
                result[key] = undefined;
            } else {
                const keyProperty = property.prefixItems?.length ? 'name' : 'value'; // 'name' for PSearchDropdown, 'value' for PTextInput
                result[key] = result[key].map(d => ({ [keyProperty]: d }));
            }
        }
    });
    return result;
};

export const initJsonInputDataWithSchema = (schema?: JsonSchema, formData?: object): string|undefined => {
    if (formData === null || formData === undefined) return undefined;
    try {
        return JSON.stringify(initFormDataWithSchema(schema, formData), undefined, 2);
    } catch (e) {
        return undefined;
    }
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

export const initRefinedFormData = (schema?: JsonSchema, formData?: any, isRoot?: boolean): any => {
    if (typeof formData !== 'object' || Array.isArray(formData)) {
        if (isRoot) {
            console.error(new Error('[JsonSchemaForm] Only object is available for formData prop'));
            return {};
        }
        return formData;
    }

    const { properties } = schema ?? {};
    const result = {};
    if (!properties) return formData;
    Object.keys(properties).forEach((key) => {
        const property = properties[key];
        result[key] = refineValueByProperty(property, formData?.[key] ?? property.default);
    });
    return result;
};

export const getComponentNameBySchemaProperty = (schemaProperty: InnerJsonSchema): ComponentName => {
    if (schemaProperty.format === 'generate_id') return 'GenerateIdFormat';
    if (schemaProperty.type === 'object') return 'PJsonSchemaForm';
    if (schemaProperty.prefixItems?.length) return 'PSearchDropdown';
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
    } else if (schemaProperty.prefixItems?.length) {
        const results: SelectDropdownMenu[] = [];
        try {
            schemaProperty.prefixItems.forEach((item) => {
                if (item?.enum?.length) {
                    results.push(...item.enum.map(d => ({ name: d, label: d })));
                }
            });
            return results;
        } catch (e: unknown) {
            console.error(e);
            return undefined;
        }
    }
    return undefined;
};
