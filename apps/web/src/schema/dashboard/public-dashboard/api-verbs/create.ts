import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';
import type {
    DashboardLayoutWidgetInfo, DashboardOptions, DashboardVariables, DashboardVariablesSchema,
} from '@/schema/dashboard/_types/dashboard-type';


export interface PublicDashboardCreateParameters {
    name: string;
    layouts?: DashboardLayoutWidgetInfo[][];
    variables?: DashboardVariables;
    options?: DashboardOptions;
    variables_schema?: DashboardVariablesSchema;
    labels?: string[];
    tags?: Tags;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>;
    workspace_id?: string;
    project_id?: string;
}
