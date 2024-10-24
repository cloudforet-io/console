import type { Tags } from '@/schema/_common/model';
import type {
    DashboardOptions, DashboardVariables, DashboardVariablesSchema, DashboardLayout,
    DashboardVars,
    DashboardGlobalVariablesSchema,
} from '@/schema/dashboard/_types/dashboard-type';


export interface PublicDashboardUpdateParameters {
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
