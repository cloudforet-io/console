import type { Sort } from '@cloudforet/core-lib/space-connector/type';

import type { Page } from '@/schema/_common/type';
import type { DashboardVars } from '@/schema/dashboard/_types/dashboard-type';

export interface PrivateWidgetLoadParameters {
    widget_id: string;
    granularity: string;
    start: string;
    end: string;
    group_by?: string[];
    sort?: Sort[];
    page?: Page
    vars?: DashboardVars;
}
