import type { Tags } from '@/schema/_common/model';

import type { WidgetSize } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetState, WidgetType } from '@/common/modules/widgets/types/widget-model';

import type { SharedDataTableInfo } from '@/services/dashboards/types/shared-dashboard-type';

export interface PublicWidgetCreateParameters {
    dashboard_id: string;
    name?: string;
    description?: string;
    size?: WidgetSize;
    widget_type?: WidgetType;
    options?: Record<string, any>;
    data_table_id?: number;
    data_tables?: SharedDataTableInfo[];
    tags?: Tags;
    state?: WidgetState;
}
