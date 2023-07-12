import { isEmpty } from 'lodash';
import type { Ref } from 'vue';
import { watch } from 'vue';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import type { DashboardLayoutWidgetInfo, WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetInheritOptionsErrorMap } from '@/services/dashboards/widgets/_helpers/widget-validation-helper';

interface UseWidgetValidatorOptions {
    validateOnVariablesSchemaChange: Ref<boolean>;
    dashboardWidgetInfoList: Ref<DashboardLayoutWidgetInfo[]>;
    widgetConfigMap: Ref<Record<string, WidgetConfig>>;
    variablesSchema: Ref<DashboardVariablesSchema>;
    updateWidgetValidMap: (validMap: Record<string, boolean>) => void;
}
export const useWidgetValidator = ({
    validateOnVariablesSchemaChange, dashboardWidgetInfoList, widgetConfigMap, variablesSchema, updateWidgetValidMap,
}: UseWidgetValidatorOptions) => {
    const validateAllWidget = () => {
        const _widgetValidMap: Record<string, boolean> = {};
        dashboardWidgetInfoList.value.forEach((widgetInfo: DashboardLayoutWidgetInfo) => {
            const _widgetConfig = widgetConfigMap.value[widgetInfo.widget_key];
            const _widgetSchemaErrorMap = getWidgetInheritOptionsErrorMap(
                widgetInfo.inherit_options,
                _widgetConfig.options_schema?.schema,
                variablesSchema.value,
            );
            _widgetValidMap[widgetInfo.widget_key] = isEmpty(_widgetSchemaErrorMap);
        });
        updateWidgetValidMap(_widgetValidMap);
    };
    watch(() => variablesSchema.value, () => {
        if (validateOnVariablesSchemaChange.value) validateAllWidget();
    }, { immediate: true });
};
