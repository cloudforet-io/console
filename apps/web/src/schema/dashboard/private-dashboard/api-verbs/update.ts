import type { Tags } from '@/schema/_common/model';
import type {
    DashboardLayoutWidgetInfo, DashboardSettings, DashboardVariables, DashboardVariablesSchema,
} from '@/schema/dashboard/_types/dashboard-type';


export interface PrivateDashboardUpdateParameters {
    private_dashboard_id: string;
    name?: string;
    layouts?: DashboardLayoutWidgetInfo[][];
    variables?: DashboardVariables;
    settings?: DashboardSettings;
    variables_schema?: DashboardVariablesSchema;
    labels?: string[];
    tags?: Tags;
}
