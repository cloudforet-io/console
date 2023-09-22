import { getComponentNameBySchemaProperty } from '@/inputs/forms/json-schema-form/helpers/inner-schema-helper';
import type { JsonSchema } from '@/inputs/forms/json-schema-form/type';

export const initFormDataWithSchema = (schema?: JsonSchema, formData?: object): object => {
    const { properties } = schema ?? {} as JsonSchema;

    const result = {};
    if (!properties) return {};
    Object.keys(properties).forEach((key) => {
        const property = properties[key];
        const componentName = getComponentNameBySchemaProperty(property);

        // set value with default value or undefined
        result[key] = formData?.[key] ?? property.default ?? undefined;

        // refine value for component spec
        if (componentName === 'PFilterableDropdown' && typeof result[key] === 'string') {
            result[key] = [{ name: result[key], label: result[key] }];
        }

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
