import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';
import type {
    DashboardOptions, DashboardVariables, DashboardVariablesSchema,
    DashboardVars,
    DashboardGlobalVariablesSchema,
} from '@/api-clients/dashboard/_types/dashboard-type';

import type { SharedDashboardLayout } from '@/services/dashboards/types/shared-dashboard-type';


export interface PublicDashboardCreateParameters {
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
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>;
    project_id?: string;
    project_group_id?: string;
}
