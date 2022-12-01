import type { WIDGET_FRAME_WIDTH_RANGE_LIST, WIDGET_FRAME_WIDTH_FULL } from '@/services/dashboards/dashboard-detail/lib/config';

// = 'SM' | 'MD' | 'LG' | 'XL' | 'FULL';
export type WidgetFrameSize = keyof typeof WIDGET_FRAME_WIDTH_RANGE_LIST | typeof WIDGET_FRAME_WIDTH_FULL;
