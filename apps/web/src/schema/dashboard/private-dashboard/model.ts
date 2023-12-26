import type { Tags } from '@/schema/_common/model';
import type { DashboardTemplate } from '@/schema/dashboard/_types/dashboard-type';


export interface PrivateDashboardModel extends DashboardTemplate {
    private_dashboard_id: string;
    tags: Tags;
    user_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
