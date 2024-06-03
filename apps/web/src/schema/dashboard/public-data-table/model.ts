import type { ResourceGroupType } from '@/schema/_common/type';

import type { DataTableModel } from '@/common/modules/widgets/types/widget-model';

export interface PublicDataTableModel extends DataTableModel {
    public_dashboard_id: string;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>;
    project_id: string;
}
