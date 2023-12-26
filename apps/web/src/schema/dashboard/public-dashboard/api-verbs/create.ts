import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';
import type {
    DashboardLayoutWidgetInfo, DashboardSettings, DashboardVariables, DashboardVariablesSchema,
} from '@/schema/dashboard/_types/dashboard-type';


export interface CreatePublicDashboardParameters {
    name: string;
    layouts?: DashboardLayoutWidgetInfo[][];
    variables?: DashboardVariables;
    settings?: DashboardSettings;
    variables_schema?: DashboardVariablesSchema;
    labels?: string[];
    tags?: Tags;
    resource_group: ResourceGroupType;
    workspace_id?: string;
    project_id?: string;
}
