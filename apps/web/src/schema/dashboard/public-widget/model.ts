import type { ResourceGroupType } from '@/schema/_common/type';

import type { WidgetModel } from '@/common/modules/widgets/types/widget-model';


export interface PublicWidgetModel extends WidgetModel {
    dashboard_id: string;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>;
    project_id?: string;
}
