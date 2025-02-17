import type { Sort } from '@cloudforet/core-lib/space-connector/type';

import type { Page } from '@/api-clients/_common/schema/type';
import type { DashboardVars } from '@/api-clients/dashboard/_types/dashboard-type';

export interface PublicWidgetLoadParameters {
    widget_id: string;
    granularity: string;
    start: string;
    end: string;
    group_by?: string[];
    sort?: Sort[];
    page?: Page
    vars?: DashboardVars;
}
