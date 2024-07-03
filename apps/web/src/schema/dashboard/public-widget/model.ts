import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';

import type { WidgetSize } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetFieldName } from '@/common/modules/widgets/types/widget-field-type';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';
import type { WidgetType, WidgetStatus } from '@/common/modules/widgets/types/widget-model';


export interface PublicWidgetModel {
    dashboard_id: string;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>;
    project_id?: string;
    widget_id: string;
    name: string;
    description: string;
    size: WidgetSize;
    data_table_id: string;
    widget_type: WidgetType;
    options: Record<WidgetFieldName, WidgetFieldValues>;
    tags: Tags;
    workspace_id?: string;
    domain_id?: string;
    created_at: string;
    updated_at: string;
    state: WidgetStatus;
}
