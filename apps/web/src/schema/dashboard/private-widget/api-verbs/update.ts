import type { Tags } from '@/schema/_common/model';

import type { WidgetType } from '@/common/modules/widgets/types/model';

export interface PrivateWidgetUpdateParameters {
    widget_id: string;
    name?: string;
    description?: string;
    widget_type: WidgetType;
    options?: Record<string, any>;
    tags?: Tags;
}
