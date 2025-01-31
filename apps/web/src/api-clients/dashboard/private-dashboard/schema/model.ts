import type { Tags } from '@/api-clients/_common/schema/model';
import type {
    DashboardLayout,
    DashboardOptions,
    DashboardVariables,
    DashboardVariablesSchema,
    DashboardVars,
    DashboardGlobalVariablesSchema,
} from '@/api-clients/dashboard/_types/dashboard-type';


export interface PrivateDashboardModel {
    dashboard_id: string;
    name: string;
    description: string;
    version: string;
    layouts: DashboardLayout[];
    vars?: DashboardVars;
    vars_schema?: DashboardGlobalVariablesSchema;
    options: DashboardOptions;
    variables_schema?: DashboardVariablesSchema; // will be deprecated
    variables?: DashboardVariables; // will be deprecated
    labels?: string[];
    //
    tags: Tags;
    folder_id: string;
    user_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
