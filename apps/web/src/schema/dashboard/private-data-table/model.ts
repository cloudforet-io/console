import type { DataTableModel } from '@/common/modules/widgets/types/widget-model';

export interface PrivateDataTableModel extends DataTableModel {
    private_dashboard_id: string;
    user_id: string;
}
