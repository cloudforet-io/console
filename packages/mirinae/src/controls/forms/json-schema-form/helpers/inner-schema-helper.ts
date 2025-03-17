import { isEmpty } from 'lodash';

import type { AutocompleteHandler, SelectDropdownMenuItem } from '@/controls/dropdown/select-dropdown/type';
import { NUMERIC_TYPES } from '@/controls/forms/json-schema-form/helpers/form-data-refine-helper';
import type {
    ComponentName, JsonSchema, ReferenceHandler, TextInputType,
    InnerJsonSchema,
} from '@/controls/forms/json-schema-form/type';
import type { InputAppearanceType } from '@/controls/input/text-input/type';


const isStrictArraySelectMode = (schemaProperty: JsonSchema): boolean => {
    if (schemaProperty.reference) return true;
    if (typeof schemaProperty.items === 'object') {
        return Array.isArray((schemaProperty.items as JsonSchema).enum);
    }
    return false;
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
            items = Array.isArray((schemaProperty.items as JsonSchema).enum) ? (schemaProperty.items as JsonSchema).enum : undefined;
        }
    }

    return items?.filter((d) => typeof d === 'string');
};

export const getComponentNameBySchemaProperty = (schemaProperty: JsonSchema): ComponentName => {
    if (schemaProperty.format === 'generate_id') return 'GenerateIdFormat';
    if (schemaProperty.format === 'pem_key') return 'PEMKeyFormat';
    if (schemaProperty.type === 'object') return 'PJsonSchemaForm';
    if (Array.isArray(schemaProperty.enum) && schemaProperty.type === 'string') return 'PSelectDropdown';
    if (isStrictArraySelectMode(schemaProperty)) return 'PFilterableDropdown';
    if (schemaProperty.type === 'boolean') return 'PToggleButton';
    return 'PTextInput';
};

const getInputTypeBySchemaProperty = (schemaProperty: JsonSchema): TextInputType => {
    if (!schemaProperty.type) return 'text';
    if (schemaProperty.format === 'password') return 'password';
    if (schemaProperty.type === 'string') return 'text';
    if (NUMERIC_TYPES.includes(schemaProperty.type)) return 'number';
    return 'text';
};

const getInputPlaceholderBySchemaProperty = (schemaProperty: JsonSchema) => schemaProperty.examples?.[0] ?? '';

const getMenuItemsBySchemaProperty = (schemaProperty: JsonSchema): SelectDropdownMenuItem[]|undefined => {
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

const getMultiInputMode = (schemaProperty: JsonSchema): boolean => {
    if (schemaProperty.type !== 'array') return false;
    return schemaProperty?.maxItems !== 1;
};

const getUseAutoComplete = (schemaProperty: JsonSchema): boolean => schemaProperty.type === 'array';

const getAppearanceType = (schemaProperty: JsonSchema): InputAppearanceType|undefined => {
    if (getInputTypeBySchemaProperty(schemaProperty) === 'password') return 'masking';
    if (getComponentNameBySchemaProperty(schemaProperty) === 'PTextInput') {
        if (schemaProperty.type === 'array') return 'stack';
        return 'basic';
    }
    if (getComponentNameBySchemaProperty(schemaProperty) === 'PFilterableDropdown') {
        if (schemaProperty.type === 'array') return 'badge';
        return 'basic';
    }
    return undefined;
};

const getReferenceHandler = (propertyName: string, schemaProperty: JsonSchema, referenceHandler: ReferenceHandler): AutocompleteHandler|undefined => {
    if (!schemaProperty.reference) return undefined;

    const handler = referenceHandler;
    if (!handler) return undefined;

    return (inputText, pageStart, pageSize, filters) => handler(inputText, {
        propertyName, schemaProperty, pageStart, pageSize, filters,
    });
};

export const getSchemaProperties = (schema?: JsonSchema, referenceHandler?: ReferenceHandler): InnerJsonSchema[] => {
    const properties: object|undefined = schema?.properties;
    const order: string[] = schema?.order ?? [];
    if (properties && !isEmpty(properties)) {
        return Object.entries(properties).map(([k, schemaProperty]) => {
            const refined: InnerJsonSchema = {
                ...schemaProperty,
                propertyName: k,
                componentName: getComponentNameBySchemaProperty(schemaProperty),
                inputType: getInputTypeBySchemaProperty(schemaProperty),
                inputPlaceholder: getInputPlaceholderBySchemaProperty(schemaProperty),
                menuItems: getMenuItemsBySchemaProperty(schemaProperty),
                multiInputMode: getMultiInputMode(schemaProperty),
                useAutoComplete: getUseAutoComplete(schemaProperty),
                appearanceType: getAppearanceType(schemaProperty),
                referenceHandler: referenceHandler ? getReferenceHandler(k, schemaProperty, referenceHandler) : undefined,
            };
            return refined;
        }).sort((a, b) => {
            const orderA = order.findIndex((propertyName) => propertyName === a.propertyName);
            const orderB = order.findIndex((propertyName) => propertyName === b.propertyName);

            // If both do not have order information, they are sorted based on title or property name.
            if (orderA === -1 && orderB === -1) {
                const textA = a.title ?? a.propertyName;
                const textB = b.title ?? b.propertyName;
                return textA.localeCompare(textB);
            }

            // If only one of them does not have order information, the item without order information is placed at the back.
            if (orderA === -1) return 1;
            if (orderB === -1) return -1;

            // If both have order information, sort based on the order information.
            return orderA - orderB;
        });
    }
    return [];
};
