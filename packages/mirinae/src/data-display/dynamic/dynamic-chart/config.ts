import type { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';

export const DEFAULT_NAME_OPTIONS: DynamicField = Object.freeze({ key: 'name', type: 'text' });

export const DEFAULT_VALUE_OPTIONS: DynamicField = Object.freeze({ key: 'value', type: 'text' });

export const DYNAMIC_CHART_TYPE = ['COLUMN', 'DONUT', 'TREEMAP'] as const;

export const DYNAMIC_CHART_THEMES = ['VIOLET', 'BLUE', 'CORAL', 'YELLOW', 'GREEN', 'PEACOCK', 'RED', 'INDIGO'] as const;

export const DYNAMIC_CHART_LIMIT_MAP = {
    COLUMN: 8,
    DONUT: 5,
    TREEMAP: 10,
};
