import type { Tags } from '@/schema/_common/model';

import type { WidgetSize } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetType, WidgetStatus } from '@/common/modules/widgets/types/widget-model';

export interface PrivateWidgetCreateParameters {
    dashboard_id: string;
    name?: string;
    description?: string;
    size?: WidgetSize;
    widget_type?: WidgetType;
    options?: Record<string, any>;
    tags?: Tags;
    state?: WidgetStatus;
}
