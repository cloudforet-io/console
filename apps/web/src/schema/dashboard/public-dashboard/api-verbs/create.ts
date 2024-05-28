import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';
import type {
    DashboardLayoutWidgetInfo, DashboardSettings, DashboardVariables, DashboardVariablesSchema,
    TemplateType,
} from '@/schema/dashboard/_types/dashboard-type';


export interface PublicDashboardCreateParameters {
    name: string;
    template_id: string;
    template_type: TemplateType;
    layouts?: DashboardLayoutWidgetInfo[][];
    variables?: DashboardVariables;
    settings?: DashboardSettings;
    variables_schema?: DashboardVariablesSchema;
    display_info?: {
        icon?: string;
        preview_image?: string;
    };
    labels?: string[];
    tags?: Tags;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>;
    workspace_id?: string;
    project_id?: string;
}
