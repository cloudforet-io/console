import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/config';

export const refreshInterval = ['off', '15s', '30s', '1m', '5m', '10m', '30m', '1h'];

export type RefreshInterval = typeof refreshInterval[number];


export const DASHBOARD_SCOPE = {
    DOMAIN: 'DOMAIN',
    PROJECT: 'PROJECT',
};
export const DASHBOARD_VIEWER = {
    PUBLIC: 'PUBLIC',
    PRIVATE: 'PRIVATE',
};

export const GRANULARITY = {
    ACCUMULATED: 'ACCUMULATED',
    DAILY: 'DAILY',
    MONTHLY: 'MONTHLY',
    YEARLY: 'YEARLY',
} as const;

export const VARIABLE_SELECTION_TYPES = ['SINGLE', 'MULTI'] as const;
type VariableSelectionType = typeof VARIABLE_SELECTION_TYPES[number];

export const VARIABLE_TYPES = ['MANAGED', 'CUSTOM'] as const;
type VariableType = typeof VARIABLE_TYPES[number];

export type DashboardScope = keyof typeof DASHBOARD_SCOPE;
export type DashboardViewer = keyof typeof DASHBOARD_VIEWER;

export interface DateRange {
    start?: string;
    end?: string;
}

type DashboardVariables = Record<string, any|any[]>;

interface DashboardSettings {
    date_range: {
        enabled: boolean;
    } & DateRange;
    currency: {
        enabled: boolean;
        value?: string;
    }
}

export interface DashboardConfig {
    name: string;
    layouts: DashboardLayoutWidgetInfo[][];
    dashboard_variables: DashboardVariables;
    settings: DashboardSettings;
    dashboard_variables_schema: DashboardVariablesSchema;
    labels: string[];
    version: string;
    description?: {
        preview_image?: string;
    }
}

// variables schema
export interface DashboardVariableSchemaProperty {
    variable_type: VariableType;
    use?: boolean;
    selection_type?: VariableSelectionType;
    options?: any[];
    name?: string; // for managed variables
    default_use?: boolean; // for managed variables. If property exists, ignore it. Otherwise, replace value of 'use'.
}
export interface DashboardVariablesSchema {
    properties: {
        [key: string]: DashboardVariableSchemaProperty;
    };
    order: string[];
}

