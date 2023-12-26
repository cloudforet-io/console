import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';
import type {
    DashboardLayoutWidgetInfo, DashboardSettings, DashboardVariables, DashboardVariablesSchema,
} from '@/schema/dashboard/_types/dashboard-type';


export interface CreatePublicDashboardParameters {
    name: string;
    layouts?: DashboardLayoutWidgetInfo[][];
    variables?: DashboardVariables;
    variables_schema?: DashboardVariablesSchema;
    settings?: DashboardSettings;
    labels?: string[];
    tags?: Tags;
    resource_group: ResourceGroupType;
    project_id?: string;
}
