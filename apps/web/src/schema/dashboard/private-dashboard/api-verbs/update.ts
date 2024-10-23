import type { Tags } from '@/schema/_common/model';
import type { DashboardGlobalVariable } from '@/schema/dashboard/_types/dashboard-global-variable-type';
import type {
    DashboardOptions, DashboardVariables, DashboardVariablesSchema, DashboardLayout,
    DashboardVars,
} from '@/schema/dashboard/_types/dashboard-type';


export interface PrivateDashboardUpdateParameters {
    dashboard_id: string;
    name?: string;
    layouts?: DashboardLayout[];
    vars?: DashboardVars;
    vars_schema?: Record<string, DashboardGlobalVariable>;
    variables?: DashboardVariables;
    options?: DashboardOptions;
    variables_schema?: DashboardVariablesSchema;
    labels?: string[];
    tags?: Tags;
    folder_id?: string;
}
