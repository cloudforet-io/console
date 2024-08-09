import type { PrivateDashboardModel } from '@/schema/dashboard/private-dashboard/model';
import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PrivateWidgetModel } from '@/schema/dashboard/private-widget/model';
import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';


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
    Pick<DashboardModel, 'name' | 'options' | 'labels'> & {
    layouts: Array<{
        name?: string;
        widgets: SharedWidgetInfo[];
    }>;
};
