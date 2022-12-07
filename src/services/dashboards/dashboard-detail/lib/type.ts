import type { WidgetConfig } from '@/services/dashboards/widgets/config';
import type { WidgetTheme } from '@/services/dashboards/widgets/view-config';


export type WidgetThemeOption = WidgetConfig['theme'];

// ['violet' | 'blue' | 'coral' ... | undefined]
export type WidgetThemeAssignedList = Array<WidgetTheme | undefined>;
