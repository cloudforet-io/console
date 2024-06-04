import type { WidgetModel } from '@/common/modules/widgets/types/widget-model';


export interface PrivateWidgetModel extends WidgetModel {
    dashboard_id: string;
    user_id: string;
}
