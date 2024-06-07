import type { Tags } from '@/schema/_common/model';
import type {
    DashboardOptions, DashboardVariables, DashboardVariablesSchema, DashboardLayout,
} from '@/schema/dashboard/_types/dashboard-type';


export interface PrivateDashboardUpdateParameters {
    dashboard_id: string;
    name?: string;
    layouts?: DashboardLayout[];
    variables?: DashboardVariables;
    options?: DashboardOptions;
    variables_schema?: DashboardVariablesSchema;
    labels?: string[];
    tags?: Tags;
}
