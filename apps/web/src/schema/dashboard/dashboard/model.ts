import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';
import type { DashboardTemplate, DashboardType } from '@/schema/dashboard/_types/dashboard-type';


export interface DashboardModel extends DashboardTemplate {
    dashboard_id: string;
    dashboard_type: DashboardType;
    tags: Tags;
    user_id: string;
    resource_group: ResourceGroupType;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
