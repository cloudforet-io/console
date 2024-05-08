import type { AsyncComponent } from 'vue';

import { WIDGET_COMPONENTS } from '@/services/dashboards/widgets/_constants/widget-components-constant';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-config-helper';

export const getWidgetComponent = (widgetConfigId: string): AsyncComponent => {
    const config = getWidgetConfig(widgetConfigId);
    if (!config) throw new Error(`No matching widget configuration found. ${widgetConfigId} does not exist.`);
    const widgetComponent = WIDGET_COMPONENTS[config.widget_config_id];
    if (!widgetComponent) throw new Error(`No matching widget component found. ${widgetComponent} does not exist.`);

    return widgetComponent;
};
