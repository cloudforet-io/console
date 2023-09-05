import dayjs from 'dayjs';
import { merge } from 'lodash';
import type { ComputedRef, UnwrapRef } from 'vue';
import {
    computed, reactive,
} from 'vue';

import { CURRENCY } from '@/store/modules/settings/config';

import type { DashboardSettings, DashboardVariables } from '@/services/dashboards/config';
import type {
    WidgetConfig, WidgetOptions,
    InheritOptions, WidgetProps,
} from '@/services/dashboards/widgets/_configs/config';
import { getWidgetFilterDataKey } from '@/services/dashboards/widgets/_helpers/widget-filters-helper';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';
import type { InheritOptionsErrorMap } from '@/services/dashboards/widgets/_helpers/widget-validation-helper';
import { getWidgetInheritOptionsErrorMap } from '@/services/dashboards/widgets/_helpers/widget-validation-helper';

export interface WidgetBaseState {
    widgetConfig: ComputedRef<WidgetConfig>;
    options: ComputedRef<WidgetOptions>;
    settings: ComputedRef<DashboardSettings|undefined>;
}
export function useWidgetBaseState(
    props: WidgetProps,
) {
    const optionsErrorMap = computed(() => getWidgetInheritOptionsErrorMap(
        props.inheritOptions,
        state.widgetConfig?.options_schema?.schema,
        props.dashboardVariablesSchema,
    ));

    const state = reactive<WidgetBaseState>({
        widgetConfig: computed<WidgetConfig>(() => getWidgetConfig(props.widgetConfigId)),
        options: computed<WidgetOptions>(() => getRefinedOptions(
            state.widgetConfig.options,
            props.options,
            props.inheritOptions,
            props.dashboardVariables,
            optionsErrorMap.value,
        )),
        settings: computed<DashboardSettings|undefined>(() => {
            if (!props.dashboardSettings) return undefined;
            const dateRange = props.dashboardSettings.date_range;
            const currency = props.dashboardSettings.currency;
            return {
                date_range: dateRange ? {
                    enabled: dateRange.enabled ?? false,
                    start: dateRange.start ? dayjs(dateRange.start).utc().format('YYYY-MM') : undefined,
                    end: dateRange.end ? dayjs(dateRange.end).utc().format('YYYY-MM') : undefined,
                } : { enabled: false },
                currency: currency ? {
                    enabled: currency.enabled ?? false,
                    value: currency.value ?? CURRENCY.USD,
                } : { enabled: false },
                refresh_interval_option: props.dashboardSettings.refresh_interval_option ?? 'off',
            };
        }),
    }) as UnwrapRef<WidgetBaseState>;

    return state;
}


const getRefinedOptions = (
    configOptions?: WidgetOptions,
    optionsData?: WidgetOptions,
    inheritOptions?: InheritOptions,
    dashboardVariables?: DashboardVariables,
    optionsErrorMap?: InheritOptionsErrorMap,
): WidgetOptions => {
    const mergedOptions = merge({}, configOptions, optionsData);
    if (!inheritOptions || !dashboardVariables) return mergedOptions;

    const parentOptions: Partial<WidgetOptions> = convertInheritOptionsToWidgetFiltersMap(inheritOptions, dashboardVariables, optionsErrorMap);
    const refined = merge({}, mergedOptions, parentOptions);
    return refined;
};

const convertInheritOptionsToWidgetFiltersMap = (
    inheritOptions: InheritOptions,
    dashboardVariables: DashboardVariables,
    optionsErrorMap?: InheritOptionsErrorMap,
): Partial<WidgetOptions> => {
    const result: Partial<WidgetOptions> = {
        filters: {},
    };
    Object.entries(inheritOptions).forEach(([filterKey, inheritOption]) => {
        if (optionsErrorMap?.[filterKey]) return;

        const variableKey = inheritOption?.variable_info?.key;
        if (!inheritOption?.enabled || !variableKey) return;

        const variableValue = dashboardVariables[variableKey];
        if (!variableValue || !variableValue?.length) return;

        if (filterKey.startsWith('filters.')) {
            const _filterKey = filterKey.replace('filters.', '');
            const filterDataKey = getWidgetFilterDataKey(_filterKey);
            result.filters = {
                ...result.filters,
                [_filterKey]: [{ k: filterDataKey, v: variableValue, o: '=' }],
            };
        } else {
            result[filterKey] = variableValue;
        }
    });
    return result;
};
