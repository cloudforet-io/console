import type { Tags } from '@/schema/common/model';
import type { DashboardTemplate, DashboardViewer } from '@/schema/dashboard/_types/dashboard-type';

export interface ProjectDashboardModel extends DashboardTemplate {
    project_dashboard_id: string;
    project_id: string;
    viewers: DashboardViewer;
    tags: Tags;
    user_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
