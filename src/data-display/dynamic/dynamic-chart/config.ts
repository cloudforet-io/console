import { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';

export const DEFAULT_NAME_OPTIONS: DynamicField = Object.freeze({ key: 'name', type: 'text' });

export const DEFAULT_VALUE_OPTIONS: DynamicField = Object.freeze({ key: 'value', type: 'text' });

export const DYNAMIC_CHART_TYPE = ['COLUMN', 'DONUT', 'TREEMAP'] as const;

export const DEFAULT_LIMIT = 10;
