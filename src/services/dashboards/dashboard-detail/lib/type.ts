import type { WIDGET_WIDTH_RANGE_LIST, WIDGET_WIDTH_FULL } from '@/services/dashboards/dashboard-detail/lib/config';

// = 'SM' | 'MD' | 'LG' | 'XL' | 'FULL';
export type WidgetSize = keyof typeof WIDGET_WIDTH_RANGE_LIST | typeof WIDGET_WIDTH_FULL;

export interface WidgetThemeOption {
    inherit: boolean;
    inherit_count: number|undefined;
}
