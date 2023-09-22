import { initFormDataWithSchema } from '@/inputs/forms/json-schema-form/helpers/raw-form-data-helper';
import type { JsonSchema } from '@/inputs/forms/json-schema-form/type';

export const initJsonInputDataWithSchema = (schema?: JsonSchema, formData?: object): string|undefined => {
    if (formData === null || formData === undefined) return undefined;
    try {
        return JSON.stringify(initFormDataWithSchema(schema, formData), undefined, 2);
    } catch (e) {
        return undefined;
    }
};
