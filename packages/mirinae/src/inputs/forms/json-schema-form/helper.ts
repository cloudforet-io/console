import type { AutocompleteHandler } from '@/inputs/dropdown/filterable-dropdown/type';
import type { SelectDropdownMenu } from '@/inputs/dropdown/select-dropdown/type';
import type {
    ComponentName, InnerJsonSchema, JsonSchema, JsonSchemaFormProps, TextInputType,
} from '@/inputs/forms/json-schema-form/type';
import type { InputAppearanceType } from '@/inputs/input/text-input/type';

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

const getMenuItemsFromSchema = (schemaProperty: JsonSchema): string[]|undefined => {
    let items: any[]|undefined;

    // PSelectDropdown case (string, strict, single select)
    if (schemaProperty.type === 'string' && Array.isArray(schemaProperty.enum)) {
        items = schemaProperty.enum;
    } else if (schemaProperty.type === 'array') {
        // PTextInput multi input case (array, non-strict select) - not used yet
        if (!isStrictArraySelectMode(schemaProperty)) {
            if (Array.isArray(schemaProperty.items)) {
                schemaProperty.items.forEach((item) => {
                    if (typeof item === 'object' && Array.isArray(item.enum)) {
                        items = items ? items.concat(item.enum) : item.enum;
                    }
                });
            }
        // PFilterableDropdown case (array, strict select)
        } else if (typeof schemaProperty.items === 'object') {
            items = Array.isArray(schemaProperty.items.enum) ? schemaProperty.items.enum : undefined;
        }
    }

    return items?.filter((d) => typeof d === 'string');
};

const isStrictArraySelectMode = (schemaProperty: JsonSchema): boolean => {
    if (schemaProperty.reference) return true;
    if (typeof schemaProperty.items === 'object') {
        return Array.isArray(schemaProperty.items.enum);
    }
    return false;
};

export const refineValueByProperty = (schema: JsonSchema, val?: any): any => {
    const { type, disabled } = schema;
    if (disabled) return schema?.default ?? undefined;
    if (type === 'object') return val; // In case of object, child JsonSchemaForm refines the data.
    if (type === 'array') return refineArrayTypeValue(schema, val);
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
                const menuMap = {};
                if (Array.isArray(property.menuItems)) {
                    property.menuItems.forEach((d) => {
                        if (d.name) menuMap[d.name] = d;
                    });
                }
                result[key] = result[key].map((d) => ({ name: d, label: menuMap[d]?.label ?? d }));
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
    if (Array.isArray(schemaProperty.enum) && schemaProperty.type === 'string') return 'PSelectDropdown';
    if (isStrictArraySelectMode(schemaProperty)) return 'PFilterableDropdown';
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
    if (schemaProperty.reference) return undefined;
    // get menu items from menuItems
    if (Array.isArray(schemaProperty.menuItems) && schemaProperty.menuItems.length) {
        return schemaProperty.menuItems;
    }
    // get menu items from other schema keywords
    const items = getMenuItemsFromSchema(schemaProperty);
    if (items) {
        return items.map((item) => ({ name: item, label: item }));
    }
    return undefined;
};

export const getMultiInputMode = (schemaProperty: InnerJsonSchema): boolean => {
    if (schemaProperty.type !== 'array') return false;
    return schemaProperty?.maxItems !== 1;
};

export const getUseAutoComplete = (schemaProperty: InnerJsonSchema): boolean => schemaProperty.type === 'array';

export const getAppearanceType = (schemaProperty: InnerJsonSchema): InputAppearanceType|undefined => {
    if (getInputTypeBySchemaProperty(schemaProperty) === 'password') return 'masking';
    if (getComponentNameBySchemaProperty(schemaProperty) === 'PTextInput') {
        if (schemaProperty.type === 'array') return 'badge';
        return 'basic';
    }
    if (getComponentNameBySchemaProperty(schemaProperty) === 'PFilterableDropdown') {
        if (schemaProperty.type === 'array') return 'badge';
        return 'basic';
    }
    return undefined;
};

export const getReferenceHandler = (schemaProperty: InnerJsonSchema, props: JsonSchemaFormProps): AutocompleteHandler|undefined => {
    if (!schemaProperty.reference) return undefined;

    const handler = props.referenceHandler;
    if (!handler) return undefined;

    return (inputText, pageStart, pageSize) => handler(inputText, schemaProperty, pageStart, pageSize);
};
