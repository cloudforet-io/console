import type { WIDGET_WIDTH_RANGE_LIST, WIDGET_WIDTH_FULL } from '@/services/dashboards/dashboard-detail/lib/config';
import type { WidgetConfig } from '@/services/dashboards/widgets/config';
import type { WidgetTheme } from '@/services/dashboards/widgets/view-config';

// = 'SM' | 'MD' | 'LG' | 'XL' | 'FULL';
export type WidgetSize = keyof typeof WIDGET_WIDTH_RANGE_LIST | typeof WIDGET_WIDTH_FULL;

export type WidgetThemeOption = WidgetConfig['theme'];

// ['violet' | 'blue' | 'coral' ... | undefined]
export type WidgetThemeAssignedList = Array<WidgetTheme | undefined>;
