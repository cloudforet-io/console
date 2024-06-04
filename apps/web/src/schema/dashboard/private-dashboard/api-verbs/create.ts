import type { Tags } from '@/schema/_common/model';
import type {
    DashboardLayoutWidgetInfo, DashboardOptions, DashboardVariables, DashboardVariablesSchema,
} from '@/schema/dashboard/_types/dashboard-type';


export interface PrivateDashboardCreateParameters {
    name: string;
    layouts?: DashboardLayoutWidgetInfo[][];
    variables?: DashboardVariables;
    options?: DashboardOptions;
    variables_schema?: DashboardVariablesSchema;
    labels?: string[];
    tags?: Tags;
}
