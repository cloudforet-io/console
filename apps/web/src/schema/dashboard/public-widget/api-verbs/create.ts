import type { Tags } from '@/schema/_common/model';

import type { WidgetType } from '@/common/modules/widgets/types/model';

export interface PublicWidgetCreateParameters {
    dashboard_id: string;
    name?: string;
    description?: string;
    widget_type?: WidgetType;
    options?: Record<string, any>;
    tags?: Tags;
}
