// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { UnwrapRef } from 'vue';
import {
    onBeforeUnmount, onMounted, ref,
    watch,
} from 'vue';

import {
    debounce,
    isEqual,
} from 'lodash';

import type { DashboardVariables } from '@/api-clients/dashboard/_types/dashboard-type';
import type { InheritOptions } from '@/api-clients/dashboard/_types/widget-type';
import { i18n } from '@/translations';

import type { Currency } from '@/store/display/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { WidgetState } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-widget';
import {
    validateWidgetByVariablesSchemaUpdate,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-validation-helper';
import type {
    WidgetProps, WidgetEmit,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';


interface UseWidgetLifecycleOptions<Data> {
    props: WidgetProps;
    emit: WidgetEmit;
    widgetState: UnwrapRef<WidgetState>;
    initWidget: (data?: Data) => Promise<Data>;
    refreshWidget: () => Promise<Data>;
    disposeWidget?: () => void;
    onCurrencyUpdate?: (current?: Currency, previous?: Currency) => void|Promise<void>;
    onLanguageUpdate?: () => void;
}

export const useWidgetLifecycle = <Data = any>({
    props,
    emit,
    widgetState,
    initWidget,
    refreshWidget,
    disposeWidget,
    onCurrencyUpdate,
    onLanguageUpdate,
}: UseWidgetLifecycleOptions<Data>): void => {
    const initiated = ref(false);

    const refreshWidgetAndEmitEvent = debounce(() => {
        const newData = refreshWidget();
        emit('refreshed', newData);
    }, 300);

    const stopVariablesWatch = watch(() => props.dashboardVariables, (after, before) => {
        if (!initiated.value || props.errorMode || !widgetState.inheritOptions || props.disableRefreshOnVariableChange) return;
        const _isRefreshable = checkRefreshableByDashboardVariables(widgetState.inheritOptions, after, before);
        if (_isRefreshable) refreshWidgetAndEmitEvent();
    }, { deep: true });

    const stopVariablesSchemaWatch = watch(() => props.dashboardVariablesSchema, (after, before) => {
        if (!initiated.value || !widgetState.inheritOptions || !widgetState.schemaProperties || !widgetState.options
            || isEqual(after, before) || props.disableRefreshOnVariableChange) return;

        const { isWidgetUpdated, isValid, updatedWidgetInfo } = validateWidgetByVariablesSchemaUpdate({
            updatedVariablesSchema: after,
            previousVariablesSchema: before,
            widgetConfig: widgetState.widgetConfig,
            widgetInfo: {
                title: widgetState.title,
                inherit_options: widgetState.inheritOptions,
                schema_properties: widgetState.schemaProperties,
                widget_options: widgetState.options,
            },
        });

        if (isValid !== undefined) {
            emit('update-widget-validation', isValid);
        }
        if (updatedWidgetInfo) {
            emit('update-widget-info', updatedWidgetInfo);
        }
        if (isWidgetUpdated) {
            refreshWidgetAndEmitEvent();
        }
    }, { immediate: true, deep: true });

    const stopLoadingWatch = watch(() => props.loading, async (loading) => {
        if (!initiated.value && !loading) {
            const data = await initWidget(props.data);
            initiated.value = true;
            emit('initiated', data);
        }
    }, { immediate: true });

    let stopSettingsWatch;
    let stopCurrencyWatch;
    let stopLanguageWatch;

    if (widgetState.dashboardOptions) {
        stopSettingsWatch = watch(() => widgetState.dashboardOptions, (current, previous) => {
            if (!current || !previous || props.disableRefreshOnVariableChange) return;
            if (current.date_range.start !== previous.date_range.start || current.date_range.end !== previous.date_range.end) {
                refreshWidgetAndEmitEvent();
            }
        });
    }

    if (onCurrencyUpdate) {
        stopCurrencyWatch = watch(() => widgetState.currency, (current, previous) => {
            if (current !== previous) {
                onCurrencyUpdate(current, previous);
            }
        });
    }

    if (onLanguageUpdate) {
        try {
            stopLanguageWatch = watch(() => i18n.locale, async () => {
                onLanguageUpdate();
            });
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    }

    onBeforeUnmount(() => {
        if (disposeWidget) disposeWidget();
        stopVariablesWatch();
        stopVariablesSchemaWatch();
        stopLoadingWatch();
        if (stopSettingsWatch) stopSettingsWatch();
        if (stopCurrencyWatch) stopCurrencyWatch();
        if (stopLanguageWatch) stopLanguageWatch();
    });

    onMounted(() => {
        emit('mounted');
    });
};

const checkRefreshableByDashboardVariables = (
    inheritOptions: InheritOptions,
    after?: DashboardVariables,
    before?: DashboardVariables,
): boolean => {
    let _refresh = false;
    Object.values(inheritOptions).forEach((inheritOption) => {
        if (_refresh) return;
        const _variableKey = inheritOption.variable_key ?? '';
        const _after = after?.[_variableKey];
        const _before = before?.[_variableKey];
        if (!_variableKey || (!_after && !_before)) return;
        if (!isEqual(_after, _before)) _refresh = true;
    });
    return _refresh;
};
