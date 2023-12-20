import type { Tags } from '@/schema/_common/model';
import type {
    DashboardLayoutWidgetInfo, DashboardSettings, DashboardVariables, DashboardVariablesSchema,
} from '@/schema/dashboard/_types/dashboard-type';


export interface CreatePrivateDashboardParameters {
    name: string;
    layouts?: DashboardLayoutWidgetInfo[][];
    variables?: DashboardVariables;
    variables_schema?: DashboardVariablesSchema;
    settings?: DashboardSettings;
    labels?: string[];
    tags?: Tags;
}
