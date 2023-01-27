import type { Ref } from 'vue';
import { watch } from 'vue';

import { isEmpty } from 'lodash';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import type { DashboardLayoutWidgetInfo, WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetInheritOptionsErrorMap } from '@/services/dashboards/widgets/_helpers/widget-validation-helper';

interface UseWidgetValidatorOptions {
    validateOnVariablesSchemaChange: boolean;
    dashboardWidgetInfoList: Ref<DashboardLayoutWidgetInfo[]>;
    editMode: Ref<boolean|undefined>;
    widgetConfigMap: Ref<Record<string, WidgetConfig>>;
    variablesSchema: Ref<DashboardVariablesSchema>;
    updateWidgetValidMap: (validMap: Record<string, boolean>) => void;
}
export const useWidgetValidator = ({
    validateOnVariablesSchemaChange, dashboardWidgetInfoList, editMode, widgetConfigMap, variablesSchema, updateWidgetValidMap,
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
    if (validateOnVariablesSchemaChange) {
        watch(() => variablesSchema.value, () => {
            if (editMode.value) validateAllWidget();
        }, { immediate: true });
    }
};
