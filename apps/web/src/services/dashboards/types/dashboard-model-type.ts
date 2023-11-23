import type { RefreshIntervalOption } from '@/schema/dashboard/_types/dashboard-type';
import type { DomainDashboardModel } from '@/schema/dashboard/domain-dashboard/model';
import type { ProjectDashboardModel } from '@/schema/dashboard/project-dashboard/model';

import type { ManagedVariableModelConfig } from '@/lib/variable-models';
import type { EnumVariableModelConfig, ResourceValueVariableModelConfig } from '@/lib/variable-models/_base/types';


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

// dashboard model types
export type DashboardModel = DomainDashboardModel | ProjectDashboardModel;
