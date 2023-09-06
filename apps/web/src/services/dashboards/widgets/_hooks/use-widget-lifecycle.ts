import type { UnwrapRef } from 'vue';
import {
    onUnmounted, watch,
} from 'vue';

import {
    isEqual,
} from 'lodash';

import { i18n } from '@/translations';

import type { Currency } from '@/store/modules/settings/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DashboardVariables } from '@/services/dashboards/config';
import type {
    InheritOptions, WidgetProps, WidgetEmit,
} from '@/services/dashboards/widgets/_configs/config';
import {
    validateWidgetByVariablesSchemaUpdate,
} from '@/services/dashboards/widgets/_helpers/widget-validation-helper';
import type { WidgetState } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget-state';


interface UseWidgetLifecycleOptions<T extends WidgetState = WidgetState> {
    props: WidgetProps;
    emit: WidgetEmit;
    widgetState: UnwrapRef<T>;
    refreshWidget: () => any;
    disposeWidget?: () => void;
    onCurrencyUpdate?: (current?: Currency, previous?: Currency) => void|Promise<void>;
    onLanguageUpdate?: () => void;
}

export const useWidgetLifecycle = ({
    props,
    emit,
    widgetState,
    refreshWidget,
    disposeWidget,
    onCurrencyUpdate,
    onLanguageUpdate,
}: UseWidgetLifecycleOptions): void => {
    const refreshWidgetAndEmitEvent = () => {
        const newData = refreshWidget();
        emit('refreshed', newData);
    };

    onUnmounted(() => {
        if (disposeWidget) disposeWidget();
    });

    watch(() => props.dashboardVariables, (after, before) => {
        if (props.errorMode || !props.inheritOptions || props.disableRefreshOnVariableChange) return;
        const _isRefreshable = checkRefreshableByDashboardVariables(props.inheritOptions, after, before);
        if (_isRefreshable) refreshWidgetAndEmitEvent();
    }, { deep: true });

    watch(() => props.dashboardVariablesSchema, (after, before) => {
        if (!props.editMode || !props.inheritOptions || !props.schemaProperties || !props.options
            || isEqual(after, before) || props.disableRefreshOnVariableChange) return;

        const { isWidgetUpdated, isValid, updatedWidgetInfo } = validateWidgetByVariablesSchemaUpdate({
            updatedVariablesSchema: after,
            previousVariablesSchema: before,
            widgetConfig: widgetState.widgetConfig,
            widgetInfo: {
                inherit_options: props.inheritOptions,
                schema_properties: props.schemaProperties,
                widget_options: props.options,
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

    if (widgetState.settings) {
        watch(() => widgetState.settings, (current, previous) => {
            if (!current || !previous || props.disableRefreshOnVariableChange) return;
            if (current.date_range.start !== previous.date_range.start || current.date_range.end !== previous.date_range.end) {
                refreshWidgetAndEmitEvent();
            }
        });
    }

    if (onCurrencyUpdate) {
        watch(() => widgetState.currency, (current, previous) => {
            if (current !== previous) {
                onCurrencyUpdate(current, previous);
            }
        });
    }

    if (onLanguageUpdate) {
        try {
            watch(() => i18n.locale, async () => {
                onLanguageUpdate();
            });
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    }
};

const checkRefreshableByDashboardVariables = (
    inheritOptions: InheritOptions,
    after?: DashboardVariables,
    before?: DashboardVariables,
): boolean => {
    let _refresh = false;
    Object.values(inheritOptions).forEach((inheritOption) => {
        if (_refresh) return;
        const _variableKey = inheritOption.variable_info?.key ?? '';
        const _after = after?.[_variableKey];
        const _before = before?.[_variableKey];
        if (!_variableKey || (!_after && !_before)) return;
        if (!isEqual(_after, _before)) _refresh = true;
    });
    return _refresh;
};
