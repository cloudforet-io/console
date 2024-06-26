import {
    onBeforeUnmount, onMounted, ref,
    watch,
} from 'vue';

import { isEqual } from 'lodash';

import type { APIErrorToast } from '@/common/composables/error/errorHandler';
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

    const stopVariablesWatch = watch(() => props.dashboardVars, (after, before) => {
        if (isEqual(after, before)) return;
        if (!initiated.value || props.disableRefreshOnVariableChange) return;
        loadWidget();
    }, { deep: true });

    const stopLoadingWatch = watch(() => props.loading, async (loading) => {
        if (!initiated.value && !loading) {
            await loadWidget();
            initiated.value = true;
        }
    }, { immediate: true });

    let stopDashboardOptionsWatch;

    if (props.dashboardOptions) {
        stopDashboardOptionsWatch = watch(() => props.dashboardOptions, (current, previous) => {
            if (!current || !previous || props.disableRefreshOnVariableChange) return;
            if (current.date_range.start !== previous.date_range.start || current.date_range.end !== previous.date_range.end) {
                loadWidget();
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
