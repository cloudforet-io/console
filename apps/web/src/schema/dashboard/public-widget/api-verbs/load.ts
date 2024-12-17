import type { Sort } from '@cloudforet/core-lib/space-connector/type';

import type { Page } from '@/schema/_common/type';
import type { DashboardVars } from '@/schema/dashboard/_types/dashboard-type';

export interface PublicWidgetLoadParameters {
    widget_id: string;
    granularity: string;
    start: string;
    end: string;
    sort?: Sort[];
    page?: Page
    vars?: DashboardVars;
}
