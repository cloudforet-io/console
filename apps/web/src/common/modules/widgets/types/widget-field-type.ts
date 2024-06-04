import type { WidgetFieldSchema } from '@/common/modules/widgets/types/widget-config-type';


export interface WidgetFieldComponentProps<FieldOptions> {
    widgetFieldSchema: WidgetFieldSchema<FieldOptions>;
    isValid?: boolean;
    value?: any;
}
