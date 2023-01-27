import type { Ref, AsyncComponent } from 'vue';
import { computed, reactive, toRef } from 'vue';

import { cloneDeep, flattenDeep } from 'lodash';

import {
    widgetThemeAssigner,
} from '@/services/dashboards/dashboard-detail/modules/dashboard-widget-container/helpers/widget-theme-helper';
import {
    widgetWidthAssigner,
} from '@/services/dashboards/dashboard-detail/modules/dashboard-widget-container/helpers/widget-width-helper';
import type { DashboardLayoutWidgetInfo, WidgetConfig, WidgetSize } from '@/services/dashboards/widgets/_configs/config';
import type { WidgetTheme } from '@/services/dashboards/widgets/_configs/view-config';
import { getWidgetComponent, getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';

interface UseWidgetReformerOptions {
    dashboardWidgetInfoList: Ref<DashboardLayoutWidgetInfo[]>;
    containerWidth: Ref<number>;
}

interface ReformedWidgetInfo extends DashboardLayoutWidgetInfo {
    size: WidgetSize;
    theme?: WidgetTheme;
    width: number;
    component: AsyncComponent|null;
}
export const useWidgetReformer = ({
    dashboardWidgetInfoList, containerWidth,
}: UseWidgetReformerOptions) => {
    const state = reactive({
        widgetConfigMap: computed<Record<string, WidgetConfig>>(() => {
            const _configMap: Record<string, WidgetConfig> = {};
            dashboardWidgetInfoList.value.forEach((d) => {
                _configMap[d.widget_key] = getWidgetConfig(d.widget_name);
            });
            return _configMap;
        }),
    });
    const getWidgetThemes = (widgetInfoList: DashboardLayoutWidgetInfo[], widgetConfigMap: Record<string, WidgetConfig>): Array<WidgetTheme|undefined> => {
        const widgetThemeOptions: Array<WidgetConfig['theme']> = [];
        widgetInfoList.forEach((widgetInfo) => {
            widgetThemeOptions.push(widgetConfigMap[widgetInfo.widget_key].theme);
        });
        return widgetThemeAssigner(widgetThemeOptions);
    };

    return {
        reformedWidgetInfoList: computed<ReformedWidgetInfo[]>(() => {
            const widgetInfoList = dashboardWidgetInfoList.value;
            console.debug('reformedWidgetInfoList', cloneDeep(widgetInfoList));

            // get themes
            const themes = getWidgetThemes(widgetInfoList, state.widgetConfigMap);

            // get sizes
            const sizes = widgetInfoList.map((widget) => widget.size);

            // get widths
            const widths = flattenDeep(widgetWidthAssigner(sizes, containerWidth.value));

            // get reformed widget list
            const reformed: ReformedWidgetInfo[] = [];
            widgetInfoList.forEach((info, idx) => {
                let component: ReformedWidgetInfo['component'] = null;
                try {
                    component = getWidgetComponent(info.widget_name);
                } catch (e) {
                    console.error(e);
                }
                reformed.push({
                    ...info,
                    theme: themes[idx],
                    size: sizes[idx],
                    width: widths[idx],
                    component,
                });
            });

            return reformed;
        }),
        widgetConfigMap: toRef(state, 'widgetConfigMap'),
    };
};
