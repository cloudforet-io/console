import {
    onBeforeUnmount, onMounted, ref,
    watch,
} from 'vue';

import { isEqual } from 'lodash';

import type { APIErrorToast } from '@/common/composables/error/errorHandler';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import type {
    WidgetProps, WidgetEmit,
} from '@/common/modules/widgets/types/widget-display-type';


interface UseWidgetInitAndRefreshOptions<Data> {
    props: WidgetProps;
    emit: WidgetEmit;
    loadWidget: (data?: Data) => Promise<Data|APIErrorToast>;
}

export const useWidgetInitAndRefresh = <Data = any>({
    props,
    emit,
    loadWidget,
}: UseWidgetInitAndRefreshOptions<Data>): void => {
    const initiated = ref(false);

    const stopVariablesWatch = watch(() => props.dashboardVars, async (after, before) => {
        if (isEqual(after, before)) return;
        if (!initiated.value || props.disableRefreshOnVariableChange) return;
        await loadWidget();
    }, { deep: true });

    const stopLoadingWatch = watch(() => props.loading, async (loading) => {
        if (props.disableRefreshOnLoading) return;
        if (!initiated.value && !loading) {
            const widgetConfig = getWidgetConfig(props.widgetName);
            const requiredFields = Object.keys(widgetConfig?.requiredFieldsSchema || {});
            const allRequiredFieldsFilled = requiredFields.every((d) => !!props.widgetOptions?.[d]);
            if (allRequiredFieldsFilled) {
                await loadWidget();
                initiated.value = true;
            }
        }
    }, { immediate: true });

    let stopDashboardOptionsWatch;

    if (props.dashboardOptions) {
        stopDashboardOptionsWatch = watch(() => props.dashboardOptions, async (current, previous) => {
            if (!current || !previous || props.disableRefreshOnVariableChange) return;
            if (current.date_range?.start !== previous.date_range?.start || current.date_range?.end !== previous.date_range?.end) {
                await loadWidget();
            }
        });
    }

    onBeforeUnmount(() => {
        stopVariablesWatch();
        stopLoadingWatch();
        if (stopDashboardOptionsWatch) stopDashboardOptionsWatch();
    });

    onMounted(() => {
        emit('mounted', props.widgetName);
    });
};
