import type { Tags } from '@/schema/_common/model';
import type {
    DashboardLayoutWidgetInfo, DashboardSettings, DashboardVariables, DashboardVariablesSchema,
} from '@/schema/dashboard/_types/dashboard-type';


export interface PrivateDashboardCreateParameters {
    name: string;
    template_id: string;
    template_type: string;
    layouts?: DashboardLayoutWidgetInfo[][];
    variables?: DashboardVariables;
    settings?: DashboardSettings;
    variables_schema?: DashboardVariablesSchema;
    labels?: string[];
    tags?: Tags;
}
