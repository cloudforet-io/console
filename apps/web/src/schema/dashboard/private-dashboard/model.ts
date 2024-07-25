import type { Tags } from '@/schema/_common/model';
import type {
    DashboardLayout,
    DashboardOptions,
    DashboardVariables,
    DashboardVariablesSchema,
    DashboardVars,
} from '@/schema/dashboard/_types/dashboard-type';


export interface PrivateDashboardModel {
    dashboard_id: string;
    version: number|string;
    layouts: DashboardLayout[];
    vars?: DashboardVars;
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
