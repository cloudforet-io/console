import {
    onBeforeUnmount, onMounted, ref,
    watch,
} from 'vue';

import isEqual from 'lodash/isEqual';

import type {
    WidgetProps, WidgetEmit,
} from '@/common/modules/widgets/types/widget-display-type';


interface UseWidgetInitAndRefreshOptions {
    props: WidgetProps;
    emit: WidgetEmit;
    loadWidget: (...args: any) => Promise<void>|void;
}

export const useWidgetInitAndRefresh = ({
    props,
    emit,
    loadWidget,
}: UseWidgetInitAndRefreshOptions): void => {
    const initiated = ref(false);

    const stopVariablesWatch = watch(() => props.dashboardVars, async (after, before) => {
        if (isEqual(after, before)) return;
        if (!initiated.value || props.disableRefreshOnVariableChange) return;
        await loadWidget();
    }, { deep: true });

    const stopLoadingWatch = watch(() => props.loading, async (loading) => {
        if (props.disableRefreshOnLoading) return;
        if (!initiated.value && !loading) {
            if (props.widgetState === 'ACTIVE') {
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
