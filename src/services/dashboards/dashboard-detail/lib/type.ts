import type { WidgetConfig, DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/config';
import type { WidgetTheme } from '@/services/dashboards/widgets/view-config';

// WIDTH
export type WidgetThemeOption = WidgetConfig['theme'];
// ['violet' | 'blue' | 'coral' ... | undefined]
export type WidgetThemeAssignedList = Array<WidgetTheme | undefined>;

export interface DashboardContainerWidgetInfo extends DashboardLayoutWidgetInfo {
    widgetKey: string;
}
