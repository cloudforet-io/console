import { merge } from 'lodash';

import type { InheritOptions, WidgetConfig } from '@/services/dashboards/widgets/_configs/config';

export const getMergedWidgetInheritOptions = (widgetConfig?: WidgetConfig, inheritOptionsData?: InheritOptions): InheritOptions => {
    const mergedInheritOptions = merge({}, widgetConfig?.inherit_options ?? {}, inheritOptionsData);
    Object.values(mergedInheritOptions).forEach((inheritOption) => {
        if (inheritOption.enabled === false && inheritOption.variable_info) {
            inheritOption.variable_info = undefined;
        }
    });
    return mergedInheritOptions;
};
