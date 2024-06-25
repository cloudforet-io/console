import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';
import type {
    DashboardOptions, DashboardVariables, DashboardVariablesSchema, DashboardLayout,
} from '@/schema/dashboard/_types/dashboard-type';


export interface PublicDashboardCreateParameters {
    name: string;
    description?: string;
    layouts?: DashboardLayout[];
    options?: DashboardOptions;
    vars?: Record<string, any>;
    variables?: DashboardVariables;
    variables_schema?: DashboardVariablesSchema;
    labels?: string[];
    tags?: Tags;
    folder_id?: string;
    workspace_id?: string;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>;
    project_id?: string;
}
