import type { Tags } from '@/schema/_common/model';
import type {
    DashboardLayout, DashboardOptions, DashboardVariables, DashboardVariablesSchema,
} from '@/schema/dashboard/_types/dashboard-type';


export interface PrivateDashboardCreateParameters {
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
}
