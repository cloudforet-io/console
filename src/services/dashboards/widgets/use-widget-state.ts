import {
    computed, reactive,
} from 'vue';

import type { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { merge } from 'lodash';

import {
    palette,
} from '@/styles/colors';

import type {
    WidgetConfig, WidgetOptions, WidgetSize,
    InheritOptions, WidgetProps,
} from '@/services/dashboards/widgets/config';
import type { WidgetColorSetType, WidgetTheme } from '@/services/dashboards/widgets/view-config';
import { WIDGET_THEMES } from '@/services/dashboards/widgets/view-config';
import { getWidgetConfig } from '@/services/dashboards/widgets/widget-helper';

const getRefinedOptions = (
    configOptions?: WidgetOptions,
    optionsData?: WidgetOptions,
    inheritOptions?: InheritOptions,
    dashboardOptions?: object,
): WidgetOptions => {
    const mergedOptions = merge({}, configOptions, optionsData);
    if (!inheritOptions || !dashboardOptions) return mergedOptions;

    const parentOptions = {};
    Object.keys(inheritOptions).forEach((key) => {
        if (inheritOptions[key].enabled) parentOptions[key] = dashboardOptions[key];
    });
    return merge({}, mergedOptions, parentOptions);
};

const getColorSet = (theme: WidgetTheme, colorSetType: WidgetColorSetType = 'basic') => {
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

export function useWidgetState<Data = any>(
    props: WidgetProps,
) {
    const state = reactive({
        widgetConfig: computed<WidgetConfig>(() => getWidgetConfig(props.widgetConfigId)),
        title: computed<string>(() => props.title ?? state.widgetConfig.title),
        options: computed<WidgetOptions>(() => getRefinedOptions(
            state.widgetConfig.widget_options,
            props.options,
            props.inheritOptions,
            props.dashboardOptions,
        )),
        size: computed<WidgetSize>(() => {
            if (state.widgetConfig.sizes.includes(props.size)) return props.size;
            return state.widgetConfig.sizes[0];
        }),
        loading: true,
        data: null as Data|null,
        colorSet: computed(() => {
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
