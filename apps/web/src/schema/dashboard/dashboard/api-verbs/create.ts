import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';
import type {
    DashboardLayoutWidgetInfo, DashboardSettings, DashboardType, DashboardVariables, DashboardVariablesSchema,
} from '@/schema/dashboard/_types/dashboard-type';


export interface CreateDashboardParameters {
    name: string;
    // viewers: DashboardViewer; // deleted
    dashboard_type: DashboardType;
    layouts?: DashboardLayoutWidgetInfo[][];
    variables?: DashboardVariables;
    variables_schema?: DashboardVariablesSchema;
    settings?: DashboardSettings;
    labels?: string[];
    tags?: Tags;
    resource_group: ResourceGroupType;
    project_id?: string;
}
