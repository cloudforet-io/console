import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { DashboardTemplateState, DashboardTemplateType } from '@/schema/repository/dashboard-template/type';


export interface DashboardTemplateListParameters {
    query?: Query;
    template_id?: string;
    name?: string;
    state?: DashboardTemplateState;
    dashboard_type?: DashboardTemplateType;
    repository_id?: string;
}
