import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import type { PrivateDataTableModel } from '@/api-clients/dashboard/private-data-table/schema/model';
import type { PrivateWidgetModel } from '@/api-clients/dashboard/private-widget/schema/model';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import type { PublicDataTableModel } from '@/api-clients/dashboard/public-data-table/schema/model';
import type { PublicWidgetModel } from '@/api-clients/dashboard/public-widget/schema/model';


type DashboardModel = PublicDashboardModel | PrivateDashboardModel;
type DataTableModel = PublicDataTableModel | PrivateDataTableModel;
type WidgetModel = PublicWidgetModel | PrivateWidgetModel;

export type SharedDataTableInfo = Pick<DataTableModel, 'name' | 'data_type' | 'source_type' | 'operator' | 'options' | 'labels_info' | 'data_info'>;
export type SharedWidgetInfo =
    Pick<WidgetModel, 'size' | 'widget_type' | 'options'> & {
    data_tables: SharedDataTableInfo[];
    data_table_id: number;
};
export type SharedDashboardLayout = {
    name?: string;
    widgets: SharedWidgetInfo[];
};
export type SharedDashboardInfo =
    Pick<DashboardModel, 'name' | 'options' | 'labels' | 'vars' | 'vars_schema'> & {
    layouts: Array<{
        name?: string;
        widgets: SharedWidgetInfo[];
    }>;
};
