import type { Tags } from '@/api-clients/_common/schema/model';

import type { WidgetSize } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetType, WidgetState } from '@/common/modules/widgets/types/widget-model';

export interface PrivateWidgetUpdateParameters {
    widget_id: string;
    size?: WidgetSize;
    widget_type?: WidgetType;
    options?: Record<string, any>;
    data_table_id?: string;
    tags?: Tags;
    state?: WidgetState;
}
