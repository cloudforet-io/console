import type { TimeStamp } from '@/models';

import type { DashboardScope } from '@/services/dashboards/type';
import type { WidgetConfig } from '@/services/dashboards/widgets/config';
import type { WidgetTheme } from '@/services/dashboards/widgets/view-config';

// WIDTH
export type WidgetThemeOption = WidgetConfig['theme'];
// ['violet' | 'blue' | 'coral' ... | undefined]
export type WidgetThemeAssignedList = Array<WidgetTheme | undefined>;


// Model
export interface DashboardDetailDataModel {
    'domain_dashboard_id': string
    'name': string
    'viewers': DashboardScope
    'version': number
    'layouts': Array<any>
    'dashboard_options': any
    'settings': any
    'dashboard_options_schema': any
    'labels': Array<string>
    'tags': any
    'user_id': string
    'domain_id': string
    'created_at': TimeStamp
    'updated_at': TimeStamp
}
