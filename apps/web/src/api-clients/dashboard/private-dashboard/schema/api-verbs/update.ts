import type { Tags } from '@/api-clients/_common/schema/model';
import type {
    DashboardOptions, DashboardVariables, DashboardVariablesSchema, DashboardLayout,
    DashboardVars,
    DashboardGlobalVariablesSchema,
} from '@/api-clients/dashboard/_types/dashboard-type';


export interface PrivateDashboardUpdateParameters {
    dashboard_id: string;
    name?: string;
    layouts?: DashboardLayout[];
    vars?: DashboardVars;
    vars_schema?: DashboardGlobalVariablesSchema;
    variables?: DashboardVariables;
    options?: DashboardOptions;
    variables_schema?: DashboardVariablesSchema;
    labels?: string[];
    tags?: Tags;
    folder_id?: string;
}
