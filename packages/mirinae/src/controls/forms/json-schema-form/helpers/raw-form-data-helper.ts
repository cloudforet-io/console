/* eslint-disable no-restricted-syntax,no-await-in-loop */
import { isEqual } from 'lodash';

import { getComponentNameBySchemaProperty } from '@/controls/forms/json-schema-form/helpers/inner-schema-helper';
import type { JsonSchema, ReferenceHandler } from '@/controls/forms/json-schema-form/type';

const getDefaultRawValueForFormInput = async (key: string, property: JsonSchema, componentName: string, currentValue?: any, referenceHandler?: ReferenceHandler) => {
    let value;

    // set value with default value or undefined
    value = currentValue ?? property.default ?? undefined;

    // set value with reference handler result if reference is defined
    if (property.reference?.default_path !== undefined && referenceHandler) {
        // eslint-disable-next-line no-await-in-loop
        const handlerRes = await referenceHandler('', {
            propertyName: key,
            schemaProperty: property,
            filters: value === undefined ? undefined : [{ name: value, label: value }], // set filter with current value if it exists
        });
        if (handlerRes?.results?.length) {
            const data = handlerRes.results[property.reference.default_path];
            if (data) {
                if (componentName === 'PFilterableDropdown' || componentName === 'PTextInput') {
                    value = [data];
                } else if (componentName === 'PSelectDropdown') {
                    if (property.type === 'array') value = [data];
                } else {
                    value = data.name;
                }
            }
        }
    }

    return value;
};

const getRawValueForFormInput = async (key: string, property: JsonSchema, currentValue?: any, referenceHandler?: ReferenceHandler) => {
    let value: any;

    const componentName = getComponentNameBySchemaProperty(property);

    // set value with default value or undefined
    value = await getDefaultRawValueForFormInput(key, property, componentName, currentValue, referenceHandler);

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

export const initRawFormDataWithSchema = async (schema?: JsonSchema, formData?: object, referenceHandler?: ReferenceHandler): Promise<object> => {
    const { properties } = schema ?? {} as JsonSchema;

    const result = {};
    if (!properties) return {};

    for (const key of Object.keys(properties)) {
        result[key] = await getRawValueForFormInput(key, properties[key], formData?.[key], referenceHandler);
    }

    return result;
};


const isPropertyUpdated = (key: string, property: JsonSchema, prevProperties?: Record<string, JsonSchema>): boolean => !isEqual(property, prevProperties?.[key]);

export const updateRawFormDataWithSchema = async (
    schema?: JsonSchema,
    prevSchema?: JsonSchema,
    formData?: object,
    inputOccurredMap?: Record<string, boolean|undefined>,
    referenceHandler?: ReferenceHandler,
): Promise<[object, Record<string, boolean|undefined>]> => {
    const { properties } = schema ?? {};
    const { properties: prevProperties } = prevSchema ?? {};

    const result = { ...formData };
    const newInputOccurredMap = { ...inputOccurredMap };

    if (properties) {
        for (const key of Object.keys(properties)) {
            const property = properties[key];
            if (isPropertyUpdated(key, property, prevProperties)) {
                result[key] = await getRawValueForFormInput(key, property, undefined, referenceHandler);
                newInputOccurredMap[key] = false;
            }
        }

        // remove properties that are not in the new schema
        Object.keys(result).forEach((key) => {
            if (!properties[key]) {
                delete result[key];
                delete newInputOccurredMap[key];
            }
        });
    }


    return [result, newInputOccurredMap];
};
