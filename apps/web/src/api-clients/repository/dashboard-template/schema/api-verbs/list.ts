import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { DashboardTemplateState, DashboardTemplateType } from '@/api-clients/repository/dashboard-template/schema/type';


export interface DashboardTemplateListParameters {
    query?: Query;
    template_id?: string;
    name?: string;
    state?: DashboardTemplateState;
    dashboard_type?: DashboardTemplateType;
    repository_id?: string;
}
