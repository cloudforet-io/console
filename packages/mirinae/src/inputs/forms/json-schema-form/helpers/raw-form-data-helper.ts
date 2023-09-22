import { getComponentNameBySchemaProperty } from '@/inputs/forms/json-schema-form/helpers/inner-schema-helper';
import type { JsonSchema } from '@/inputs/forms/json-schema-form/type';

const getDefaultRawValueForFormInput = async (property: JsonSchema, currentValue?: any) => currentValue ?? property.default ?? undefined;
const getRawValueForFormInput = async (key: string, property: JsonSchema, currentValue?: any) => {
    let value: any;

    const componentName = getComponentNameBySchemaProperty(property);

    // set value with default value or undefined
    value = await getDefaultRawValueForFormInput(property, currentValue);

    // convert array type value for component spec
    if (property.type === 'array' && Array.isArray(value)) {
        const menuMap = {};
        if (Array.isArray(property.menuItems)) {
            property.menuItems.forEach((d) => {
                if (d.name) menuMap[d.name] = d;
            });
        }
        value = value.map((d) => ({ name: d, label: menuMap[d]?.label ?? d }));
        // refine value for component spec
    } else if (componentName === 'PFilterableDropdown' && typeof value === 'string') {
        value = [{ name: value, label: value }];
    }

    return value;
};

export const initRawFormDataWithSchema = (schema?: JsonSchema, formData?: object): object => {
    const { properties } = schema ?? {} as JsonSchema;

    const result = {};
    if (!properties) return {};

    Object.keys(properties).forEach((key) => {
        result[key] = getRawValueForFormInput(key, properties[key], formData?.[key]);
    });

    return result;
};
