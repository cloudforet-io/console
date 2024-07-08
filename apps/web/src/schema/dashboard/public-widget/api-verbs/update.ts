import type { Tags } from '@/schema/_common/model';

import type { WidgetSize } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetType, WidgetState } from '@/common/modules/widgets/types/widget-model';


export interface PublicWidgetUpdateParameters {
    widget_id: string;
    name?: string;
    description?: string;
    size?: WidgetSize;
    widget_type?: WidgetType;
    options?: Record<string, any>;
    data_table_id?: string;
    tags?: Tags;
    state?: WidgetState;
}
