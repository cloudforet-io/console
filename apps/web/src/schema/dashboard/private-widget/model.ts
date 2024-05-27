import type { WidgetModel } from '@/common/modules/widgets/types/model';


export interface PrivateWidgetModel extends WidgetModel {
    private_dashboard_id: string;
    user_id: string;
}
