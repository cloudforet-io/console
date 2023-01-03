import type { ComputedRef } from 'vue';
import {
    computed, reactive,
} from 'vue';

import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { merge } from 'lodash';

import type { Currency } from '@/store/modules/display/config';
import { CURRENCY } from '@/store/modules/display/config';

import {
    palette,
} from '@/styles/colors';

import type { DashboardSettings, DashboardVariables } from '@/services/dashboards/config';
import type {
    WidgetConfig, WidgetOptions, WidgetSize,
    InheritOptions, WidgetProps,
    Granularity, GroupBy,
} from '@/services/dashboards/widgets/config';
import { CHART_TYPE, WIDGET_SIZE } from '@/services/dashboards/widgets/config';
import type { WidgetColorSetType, WidgetTheme } from '@/services/dashboards/widgets/view-config';
import { WIDGET_THEMES } from '@/services/dashboards/widgets/view-config';
import { getWidgetConfig } from '@/services/dashboards/widgets/widget-helper';

const getRefinedOptions = (
    configOptions?: WidgetOptions,
    optionsData?: WidgetOptions,
    inheritOptions?: InheritOptions,
    dashboardVariables?: DashboardVariables,
): WidgetOptions => {
    const mergedOptions = merge({}, configOptions, optionsData);
    if (!inheritOptions || !dashboardVariables) return mergedOptions;

    const parentOptions = {};
    Object.keys(inheritOptions).forEach((key) => {
        if (inheritOptions[key].enabled && inheritOptions[key].variable_info?.key === key) {
            parentOptions[key] = dashboardVariables[key];
        }
    });
    return merge({}, mergedOptions, parentOptions);
};

const getColorSet = (theme: WidgetTheme, colorSetType: WidgetColorSetType = 'basic'): string[] => {
    let colorSet = WIDGET_THEMES.map((d) => palette[d][400]);
    if (colorSetType === 'massive') {
        const colors1 = WIDGET_THEMES.map((d) => [palette[d][400], palette[d][600]]).flat();
        const colors2 = WIDGET_THEMES.map((d) => [palette[d][500], palette[d][700]]).flat();
        colorSet = colors1.concat(colors2);
    }
    const themeIndex = WIDGET_THEMES.findIndex((d) => d === theme);
    if (themeIndex > -1) {
        const arr1 = colorSet.slice(themeIndex, colorSet.length);
        const arr2 = colorSet.slice(0, themeIndex);
        return arr1.concat(arr2);
    }
    return colorSet;
};

export interface WidgetState<Data = any> {
    widgetConfig: ComputedRef<WidgetConfig>;
    title: ComputedRef<string>;
    options: ComputedRef<WidgetOptions>;
    currency: ComputedRef<Currency>;
    disableFullSize: ComputedRef<boolean>;
    size: ComputedRef<WidgetSize>;
    loading: boolean;
    settings: ComputedRef<DashboardSettings>;
    data: undefined|Data;
    colorSet: ComputedRef<string[]>;
    selectorItems: ComputedRef<MenuItem[]>;
    selectedSelectorType: undefined;
}
export function useWidgetState<Data = any>(
    props: WidgetProps,
) {
    const state = reactive<WidgetState<Data>>({
        widgetConfig: computed<WidgetConfig>(() => getWidgetConfig(props.widgetConfigId)),
        title: computed<string>(() => props.title ?? state.widgetConfig.title),
        options: computed<WidgetOptions>(() => getRefinedOptions(
            state.widgetConfig.options,
            props.options,
            props.inheritOptions,
            props.dashboardVariables,
        )),
        currency: computed(() => state.settings.currency?.value ?? CURRENCY.USD),
        groupBy: computed<GroupBy>(() => state.options.group_by),
        granularity: computed<Granularity>(() => state.widgetConfig.options?.granularity),
        chartType: computed(() => state.options.chart_type ?? CHART_TYPE.LINE),
        disableFullSize: computed<boolean>(() => !state.widgetConfig.sizes.includes(WIDGET_SIZE.full)),
        isOnlyFullSize: computed<boolean>(() => state.widgetConfig.sizes.length === 1 && state.widgetConfig.sizes[0] === WIDGET_SIZE.full),
        size: computed<WidgetSize>(() => {
            if (state.widgetConfig.sizes.includes(props.size)) return props.size;
            return state.widgetConfig.sizes[0];
        }),
        loading: true,
        settings: computed<DashboardSettings>(() => props.dashboardSettings),
        data: undefined as Data|undefined,
        colorSet: computed<string[]>(() => {
            if (!props.theme) return [];
            const colorSetType: WidgetColorSetType = state.data?.length > 9 ? 'massive' : 'basic';
            return getColorSet(props.theme, colorSetType);
        }),
        selectorItems: computed<MenuItem[]>(() => {
            if (!state.options.selector_options?.enabled) return [];
            if (state.options.selector_options.type === 'cost-usage') {
                if (!state.selectedSelectorType) state.selectedSelectorType = 'cost';
                return [
                    { type: 'item', name: 'cost', label: 'Cost' },
                    { type: 'item', name: 'usage', label: 'Usage' },
                ];
            }
            if (!state.selectedSelectorType) state.selectedSelectorType = 'day';
            return [
                { type: 'item', name: 'day', label: 'Day' },
                { type: 'item', name: 'month', label: 'Month' },
            ];
        }),
        selectedSelectorType: undefined,
    });

    return state;
}
