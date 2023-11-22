import type { TranslateResult } from 'vue-i18n';


import type {
    DASHBOARD_VIEWER, REFRESH_INTERVAL_OPTIONS_MAP, DASHBOARD_SCOPE, DASHBOARD_LABEL,
} from '@/schema/dashboard/_constants/dashboard-constant';
import type { InheritOptions, WidgetOptions, WidgetSize } from '@/schema/dashboard/_types/widget-type';

import type { ManagedVariableModelConfig } from '@/lib/variable-models';
import type { EnumVariableModelConfig, ResourceValueVariableModelConfig } from '@/lib/variable-models/_base/types';


export type DashboardViewer = typeof DASHBOARD_VIEWER[keyof typeof DASHBOARD_VIEWER];
export type DashboardScope = typeof DASHBOARD_SCOPE[keyof typeof DASHBOARD_SCOPE];
export type DashboardLabel = typeof DASHBOARD_LABEL[keyof typeof DASHBOARD_LABEL];

// dashboard variable schema types
export type VariableSelectionType = 'SINGLE' | 'MULTI';

export type VariableType = 'MANAGED' | 'CUSTOM';

export type DashboardVariableOptions = ManagedVariableModelConfig|EnumVariableModelConfig|ResourceValueVariableModelConfig;

export interface DashboardVariableSchemaProperty {
    name: string;
    variable_type: VariableType;
    use: boolean;
    selection_type: VariableSelectionType;
    description?: string;
    readonly?: boolean; // can not edit value
    options?: DashboardVariableOptions[];
    fixed?: boolean; // can not delete this variable from dashboard
    required?: boolean; // value is required
}

export type DashboardVariableSchemaProperties = Record<string, DashboardVariableSchemaProperty>;

export interface DashboardVariablesSchema {
    properties: DashboardVariableSchemaProperties;
    order: string[];
}

// dashboard variables types
export type DashboardVariables = SingleSelectDashboardVariables | MultiSelectDashboardVariables;
interface SingleSelectDashboardVariables {
    [key: string]: string;
}
interface MultiSelectDashboardVariables {
    [key: string]: string[];
}

export type RefreshIntervalOption = keyof typeof REFRESH_INTERVAL_OPTIONS_MAP;
// dashboard settings types
export interface DashboardSettings {
    date_range: {
        enabled: boolean;
    } & DateRange;
    refresh_interval_option: RefreshIntervalOption;
}
export interface DateRange {
    start?: string;
    end?: string;
}

// dashboard template types
export interface DashboardTemplate {
    name: string;
    layouts: DashboardLayoutWidgetInfo[][];
    settings: DashboardSettings;
    variables: DashboardVariables;
    variables_schema: DashboardVariablesSchema;
    labels: (DashboardLabel|string)[];
    version: string;
    description?: {
        preview_image?: string;
        icon?: string;
        text?: string | TranslateResult;
    }
}

export interface DashboardLayoutWidgetInfo {
    widget_name: string; // widget config name
    widget_key: string; // widget unique key. used for layout key binding.
    title?: string; // widget title
    widget_options?: WidgetOptions;
    size?: WidgetSize;
    version: string; // widget config version
    inherit_options?: InheritOptions; // inherit information for the widget option
    schema_properties?: string[]; // schema properties that are shown on widget form. updated when use add more options.
}


