import type { AsyncComponent } from 'vue';

import type { WidgetFieldName } from '@/common/modules/widgets/types/widget-config-type';


export const WIDGET_FIELD_COMPONENTS: Record<WidgetFieldName, AsyncComponent> = {
    dataField: () => ({
        component: import('@/common/modules/widgets/_widget-fields/WidgetFieldDataField.vue'),
    }),
};
