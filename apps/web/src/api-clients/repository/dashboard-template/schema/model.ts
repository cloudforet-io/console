import type { Tags } from '@/api-clients/_common/schema/model';
import type { DashboardTemplateState, DashboardTemplateType } from '@/api-clients/repository/dashboard-template/schema/type';

import type { SharedDashboardInfo } from '@/services/dashboards/types/shared-dashboard-type';


export interface DashboardTemplateModel {
    template_id: string;
    name: string;
    state: DashboardTemplateState;
    template_type: DashboardTemplateType;
    dashboards: SharedDashboardInfo[];
    repository_info: any;
    labels: string[];
    tags: Tags;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
