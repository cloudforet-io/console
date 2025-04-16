import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';
import type {
    DashboardLayout,
    DashboardOptions,
    DashboardVariables,
    DashboardVariablesSchema,
    DashboardVars,
    DashboardScope,
    DashboardGlobalVariablesSchema,
} from '@/api-clients/dashboard/_types/dashboard-type';


export interface PublicDashboardModel {
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
    shared: boolean;
    scope: DashboardScope;
    //
    tags: Tags;
    folder_id: string;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>;
    project_id: string;
    project_group_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
