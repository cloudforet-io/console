import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';
import type { DashboardTemplate } from '@/schema/dashboard/_types/dashboard-type';


export interface PublicDashboardModel extends DashboardTemplate {
    public_dashboard_id: string;
    tags: Tags;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
