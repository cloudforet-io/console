import type { Currency } from '@/store/modules/display/config';

import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/_configs/config';


export const REFRESH_INTERVAL_OPTIONS_MAP = {
    off: 0,
    '15s': 15000,
    '30s': 30000,
    '1m': 60000,
    '5m': 300000,
    '10m': 600000,
    '30m': 1800000,
    '1h': 3600000,
} as const;
export type RefreshIntervalOption = keyof typeof REFRESH_INTERVAL_OPTIONS_MAP;

export const refreshIntervalOptionList = Object.keys(REFRESH_INTERVAL_OPTIONS_MAP) as RefreshIntervalOption[];

export const DASHBOARD_SCOPE = {
    DOMAIN: 'domain',
    PROJECT: 'project',
} as const;
export type DashboardScope = typeof DASHBOARD_SCOPE[keyof typeof DASHBOARD_SCOPE];

export const DASHBOARD_VIEWER = {
    PUBLIC: 'PUBLIC',
    PRIVATE: 'PRIVATE',
} as const;
export type DashboardViewer = typeof DASHBOARD_VIEWER[keyof typeof DASHBOARD_VIEWER];


export const GRANULARITY = {
    ACCUMULATED: 'ACCUMULATED',
    DAILY: 'DAILY',
    MONTHLY: 'MONTHLY',
    YEARLY: 'YEARLY',
} as const;

export interface DateRange {
    start?: string;
    end?: string;
}



// dashboard configs
export interface DashboardSettings {
    date_range: {
        enabled: boolean;
    } & DateRange;
    currency: {
        enabled: boolean;
        value?: Currency;
    }
}

export interface DashboardConfig {
    name: string;
    layouts: DashboardLayoutWidgetInfo[][];
    settings: DashboardSettings;
    variables: DashboardVariables;
    variables_schema: DashboardVariablesSchema;
    labels: string[];
    version: string;
    description?: {
        preview_image?: string;
        icon?: string;
    }
}

// variables
export type DashboardVariables = Record<string, string|string[]>;

export const VARIABLE_SELECTION_TYPES = ['SINGLE', 'MULTI'] as const;
export type VariableSelectionType = typeof VARIABLE_SELECTION_TYPES[number];

export const VARIABLE_TYPES = ['MANAGED', 'CUSTOM'] as const;
export type VariableType = typeof VARIABLE_TYPES[number];



// variables schema
export interface DashboardVariableSchemaProperty {
    variable_type: VariableType;
    use: boolean;
    selection_type: VariableSelectionType;
    options?: string[];
    name: string;
}
export interface DashboardVariablesSchema {
    properties: {
        [key: string]: DashboardVariableSchemaProperty;
    };
    order: string[];
}

export const MANAGE_VARIABLES_HASH_NAME = 'manage-variables';
