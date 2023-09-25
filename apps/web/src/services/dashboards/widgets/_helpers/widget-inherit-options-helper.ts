import { merge } from 'lodash';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import {
    getVariableKeyFromWidgetSchemaProperty,
} from '@/services/dashboards/dashboard-create/modules/dashboard-templates/helper';
import type { InheritOptions, WidgetConfig } from '@/services/dashboards/widgets/_configs/config';

export const getInitialWidgetInheritOptions = (widgetConfig?: WidgetConfig, storedInheritOptions?: InheritOptions, variablesSchema?: DashboardVariablesSchema): InheritOptions => {
    const merged = merge({}, widgetConfig?.inherit_options ?? {}, storedInheritOptions);

    const refined: InheritOptions = {};
    Object.entries(merged).forEach(([property, inheritOption]) => {
        if (inheritOption.enabled === false && inheritOption.variable_info) {
            refined[property] = { enabled: false };
            return;
        }

        const variableKey = getVariableKeyFromWidgetSchemaProperty(property);
        if (variablesSchema && !variablesSchema?.properties[variableKey]?.use) {
            refined[property] = { enabled: false };
            return;
        }

        refined[property] = inheritOption;
    });

    return refined;
};
