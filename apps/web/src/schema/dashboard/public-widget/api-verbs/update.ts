import type { Tags } from '@/schema/_common/model';

import type { WidgetType } from '@/common/modules/widgets/types/widget-model';

export interface PublicWidgetUpdateParameters {
    widget_id: string;
    name?: string;
    description?: string;
    widget_type: WidgetType;
    options?: Record<string, any>;
    data_table_id?: string;
    tags?: Tags;
}
