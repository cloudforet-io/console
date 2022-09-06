import type { JSONSchemaType } from 'ajv';

import type { SupportLanguage } from '@/translations';

export const TEXT_INPUT_TYPES = ['password', 'text', 'number'] as const;


export type JsonSchema<Properties = object> = JSONSchemaType<Properties>

export const VALIDATION_MODES = ['input', 'all', 'none'] as const;
export type ValidationMode = typeof VALIDATION_MODES[number]

export type InnerJsonSchema = JsonSchema & {
    id: string;
    inputType: string;
    inputPlaceholder: string;
}

export interface JsonSchemaFormProps {
    schema?: JsonSchema;
    formData?: object;
    language?: SupportLanguage;
    validationMode?: ValidationMode; // default: input
}
