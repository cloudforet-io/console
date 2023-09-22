import type { AutocompleteHandler } from '@/inputs/dropdown/filterable-dropdown/type';
import type { SelectDropdownMenuItem } from '@/inputs/dropdown/select-dropdown/type';
import { NUMERIC_TYPES } from '@/inputs/forms/json-schema-form/helpers/form-data-refine-helper';
import type {
    ComponentName, JsonSchema, TextInputType, JsonSchemaFormProps,
} from '@/inputs/forms/json-schema-form/type';
import type { InputAppearanceType } from '@/inputs/input/text-input/type';


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
    if (schemaProperty.type === 'object') return 'PJsonSchemaForm';
    if (Array.isArray(schemaProperty.enum) && schemaProperty.type === 'string') return 'PSelectDropdown';
    if (isStrictArraySelectMode(schemaProperty)) return 'PFilterableDropdown';
    return 'PTextInput';
};

export const getInputTypeBySchemaProperty = (schemaProperty: JsonSchema): TextInputType => {
    if (schemaProperty.format === 'password') return 'password';
    if (schemaProperty.type === 'string') return 'text';
    if (NUMERIC_TYPES.includes(schemaProperty.type)) return 'number';
    return 'text';
};

export const getInputPlaceholderBySchemaProperty = (schemaProperty: JsonSchema) => schemaProperty.examples?.[0] ?? '';

export const getMenuItemsBySchemaProperty = (schemaProperty: JsonSchema): SelectDropdownMenuItem[]|undefined => {
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

export const getMultiInputMode = (schemaProperty: JsonSchema): boolean => {
    if (schemaProperty.type !== 'array') return false;
    return schemaProperty?.maxItems !== 1;
};

export const getUseAutoComplete = (schemaProperty: JsonSchema): boolean => schemaProperty.type === 'array';

export const getAppearanceType = (schemaProperty: JsonSchema): InputAppearanceType|undefined => {
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

export const getReferenceHandler = (propertyName: string, schemaProperty: JsonSchema, props: JsonSchemaFormProps): AutocompleteHandler|undefined => {
    if (!schemaProperty.reference) return undefined;

    const handler = props.referenceHandler;
    if (!handler) return undefined;

    return (inputText, pageStart, pageSize, filters) => handler(inputText, {
        propertyName, schemaProperty, pageStart, pageSize, filters,
    });
};
