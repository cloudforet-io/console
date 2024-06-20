import type { WidgetSize } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetFieldName, WidgetFieldSchema } from '@/common/modules/widgets/types/widget-field-type';


export interface WidgetConfig {
    widgetName: string;
    meta: {
        title: string;
        sizes: WidgetSize[];
    };
    requiredFieldsSchema: Partial<Record<WidgetFieldName, WidgetFieldSchema>>;
    optionalFieldsSchema: Partial<Record<WidgetFieldName, WidgetFieldSchema>>;
    dependencies?: Partial<Record<WidgetFieldName, WidgetFieldName[]>>;
}
