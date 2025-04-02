// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { AsyncComponent } from 'vue';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { WIDGET_COMPONENTS } from '@/common/modules/widgets/_constants/widget-components-constant';
import { WIDGET_FIELD_COMPONENTS } from '@/common/modules/widgets/_constants/widget-field-components-constant';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import type { WidgetFieldName } from '@/common/modules/widgets/types/widget-field-type';


export const getWidgetComponent = (widgetConfigId: string): AsyncComponent|undefined => {
    const config = getWidgetConfig(widgetConfigId);
    if (!config) {
        ErrorHandler.handleError(`No matching widget configuration found. ${widgetConfigId} does not exist.`);
        return undefined;
    }
    const widgetComponent = WIDGET_COMPONENTS[config?.widgetName];
    if (!widgetComponent) {
        ErrorHandler.handleError(`No matching widget component found. ${widgetComponent} does not exist.`);
        return undefined;
    }

    return widgetComponent;
};

export const getWidgetFieldComponent = (fieldName: WidgetFieldName): AsyncComponent => {
    const widgetFieldComponent = WIDGET_FIELD_COMPONENTS[fieldName];

    return widgetFieldComponent;
};
