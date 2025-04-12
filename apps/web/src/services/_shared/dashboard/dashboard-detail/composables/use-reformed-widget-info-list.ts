import type { Ref, AsyncComponent } from 'vue';
import { computed, reactive, toRef } from 'vue';

import { flattenDeep } from 'lodash';

import type { DashboardLayoutWidgetInfo } from '@/api-clients/dashboard/_types/dashboard-type';
import type { WidgetConfig, WidgetSize } from '@/api-clients/dashboard/_types/widget-type';

import {
    widgetThemeAssigner,
} from '@/services/_shared/dashboard/dashboard-detail/helpers/widget-theme-helper';
import {
    widgetWidthAssigner,
} from '@/services/_shared/dashboard/dashboard-detail/helpers/widget-width-helper';
import { getWidgetComponent } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-component-helper';
import { getWidgetConfig } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-config-helper';
import type { WidgetTheme } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';

interface UseWidgetReformerOptions {
    dashboardWidgetInfoList: Ref<DashboardLayoutWidgetInfo[]>;
    containerWidth: Ref<number>;
}

export interface ReformedWidgetInfo extends DashboardLayoutWidgetInfo {
    size: WidgetSize;
    theme?: WidgetTheme;
    width: number;
    component: AsyncComponent|null;
}
export const useReformedWidgetInfoList = ({
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
            widgetThemeOptions.push(widgetConfigMap[widgetInfo.widget_key]?.theme);
        });
        return widgetThemeAssigner(widgetThemeOptions);
    };

    return {
        reformedWidgetInfoList: computed<ReformedWidgetInfo[]>(() => {
            const widgetInfoList = dashboardWidgetInfoList.value;

            // get themes
            const themes = getWidgetThemes(widgetInfoList, state.widgetConfigMap);

            // get sizes
            const sizes = widgetInfoList.map((widget) => widget.size ?? state.widgetConfigMap[widget.widget_key]?.sizes[0]);

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
