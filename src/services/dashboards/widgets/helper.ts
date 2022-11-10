import type { AsyncComponent } from 'vue';
import type { ImportedComponent } from 'vue/types/options';

import { kebabCase, merge, startCase } from 'lodash';

import { BASE_WIDGET_CONFIGS, CONSOLE_WIDGET_CONFIGS } from '@/services/dashboards/widgets/config';
import type { WidgetConfig } from '@/services/dashboards/widgets/type';

const widgetConfigCacheMap = {};
export const getWidgetConfig = (widgetName: string): WidgetConfig => {
    const config = CONSOLE_WIDGET_CONFIGS[widgetName];
    if (!config?.base_widget_name) return config;

    if (!widgetConfigCacheMap[widgetName]) {
        const baseWidgetName = config?.base_widget_name;
        widgetConfigCacheMap[widgetName] = merge({}, BASE_WIDGET_CONFIGS[baseWidgetName], config);
    }
    return widgetConfigCacheMap[widgetName];
};

export const getWidgetComponent = (widgetName: string): AsyncComponent => {
    const config = getWidgetConfig(widgetName);
    const baseWidgetName = config?.base_widget_name;
    const componentName = baseWidgetName ?? widgetName;
    return () => ({
        component: import(`./${baseWidgetName ? '_base/' : ''}${kebabCase(componentName)}/${startCase(componentName)}Widget.vue`) as Promise<ImportedComponent>,
    });
};
