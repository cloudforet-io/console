import type { Tags } from '@/schema/_common/model';
import type {
    DashboardGlobalVariablesSchema,
    DashboardOptions, DashboardVariables, DashboardVariablesSchema,
    DashboardVars,
} from '@/schema/dashboard/_types/dashboard-type';

import type { SharedDashboardLayout } from '@/services/dashboards/types/shared-dashboard-type';


export interface PrivateDashboardCreateParameters {
    name: string;
    description?: string;
    layouts?: SharedDashboardLayout[];
    options?: DashboardOptions;
    vars?: DashboardVars;
    vars_schema?: DashboardGlobalVariablesSchema;
    variables?: DashboardVariables;
    variables_schema?: DashboardVariablesSchema;
    labels?: string[];
    tags?: Tags;
    folder_id?: string;
    workspace_id?: string;
}
