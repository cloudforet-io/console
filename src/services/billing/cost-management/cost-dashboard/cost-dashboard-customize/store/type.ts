import { WidgetInfo } from '@/services/billing/cost-management/cost-dashboard/type';

export interface CostDashboardCustomizeState {
    originSelectedWidget: WidgetInfo;
    editedSelectedWidget: WidgetInfo;
}
