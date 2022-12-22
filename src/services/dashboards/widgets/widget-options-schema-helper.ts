import { cloneDeep } from 'lodash';

import dashboardCommonWidgetConfig from '@/services/dashboards/widgets/_base/dashboard-common/widget-config';
import type { WidgetOptionsSchema } from '@/services/dashboards/widgets/config';

export const excludePropertiesFromDashboardCommonWidgetConfig = (excludedProperties: string[]): WidgetOptionsSchema => {
    const _widgetOptionsSchema = cloneDeep(dashboardCommonWidgetConfig.options_schema);
    const properties = _widgetOptionsSchema?.schema?.properties;
    excludedProperties.forEach((d) => delete properties[d]);
    return {
        default_properties: _widgetOptionsSchema?.default_properties?.filter((d) => !excludedProperties.includes(d)),
        inheritable_properties: _widgetOptionsSchema?.inheritable_properties?.filter((d) => !excludedProperties.includes(d)),
        schema: {
            properties,
        },
    };
};
