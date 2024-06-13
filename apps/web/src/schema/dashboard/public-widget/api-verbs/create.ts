import type { Tags } from '@/schema/_common/model';

import type { WidgetSize } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetType } from '@/common/modules/widgets/types/widget-model';

export interface PublicWidgetCreateParameters {
    dashboard_id: string;
    name?: string;
    description?: string;
    size?: WidgetSize;
    widget_type?: WidgetType;
    options?: Record<string, any>;
    tags?: Tags;
}
