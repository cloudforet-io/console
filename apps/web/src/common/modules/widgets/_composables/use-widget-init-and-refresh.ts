import {
    onBeforeUnmount, onMounted, ref,
    watch,
} from 'vue';

import type {
    WidgetProps, WidgetEmit,
} from '@/common/modules/widgets/types/widget-display-type';


interface UseWidgetInitAndRefreshOptions<Data> {
    props: WidgetProps;
    emit: WidgetEmit;
    initWidget: (data?: Data) => Promise<Data>;
}

export const useWidgetInitAndRefresh = <Data = any>({
    props,
    emit,
    initWidget,
}: UseWidgetInitAndRefreshOptions<Data>): void => {
    const initiated = ref(false);

    const stopVariablesWatch = watch(() => props.dashboardVariables, () => {
        if (!initiated.value || props.disableRefreshOnVariableChange) return;
        initWidget();
    }, { deep: true });

    const stopLoadingWatch = watch(() => props.loading, async (loading) => {
        if (!initiated.value && !loading) {
            await initWidget();
            initiated.value = true;
        }
    }, { immediate: true });

    let stopDashboardOptionsWatch;

    if (props.dashboardOptions) {
        stopDashboardOptionsWatch = watch(() => props.dashboardOptions, (current, previous) => {
            if (!current || !previous || props.disableRefreshOnVariableChange) return;
            if (current.date_range.start !== previous.date_range.start || current.date_range.end !== previous.date_range.end) {
                initWidget();
            }
        });
    }

    onBeforeUnmount(() => {
        stopVariablesWatch();
        stopLoadingWatch();
        if (stopDashboardOptionsWatch) stopDashboardOptionsWatch();
    });

    onMounted(() => {
        emit('mounted');
    });
};
