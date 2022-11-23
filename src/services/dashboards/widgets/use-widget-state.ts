import {
    computed, reactive,
} from 'vue';

import { merge } from 'lodash';

import type {
    WidgetConfig, WidgetOptions, WidgetSize,
    InheritOptions, WidgetProps,
} from '@/services/dashboards/widgets/config';
import { getWidgetConfig } from '@/services/dashboards/widgets/helper';

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
    });

    return state;
}
