import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import type { WidgetTheme } from '@/services/dashboards/widgets/_configs/view-config';

// WIDTH
export type WidgetThemeOption = WidgetConfig['theme'];
// ['violet' | 'blue' | 'coral' ... | undefined]
export type WidgetThemeAssignedList = Array<WidgetTheme | undefined>;
