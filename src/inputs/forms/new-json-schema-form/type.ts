import type { SupportLanguage } from '@/translations';

export const TEXT_INPUT_TYPES = ['string', 'number', 'integer'] as const;

type JsonSchemaType = typeof TEXT_INPUT_TYPES[number]

export interface JsonSchema<T extends JsonSchemaType = JsonSchemaType> {
    type: T;
    title?: string;
    minLength?: number;
    pattern?: string;
    minimum?: number;
    maximum?: number;
    examples?: any[];
    default?: any;
    properties?: Record<string, JsonSchema>;
    enum?: any[];
    items?: JsonSchema;
    required?: string[];
}

export const VALIDATION_MODES = ['input', 'all', 'none'] as const;
export type ValidationMode = typeof VALIDATION_MODES[number]

export interface InnerJsonSchema extends JsonSchema {
    id: string;
}

export interface JsonSchemaFormProps {
    schema?: JsonSchema;
    formData?: object;
    language?: SupportLanguage;
    validationMode?: ValidationMode; // default: input
}
