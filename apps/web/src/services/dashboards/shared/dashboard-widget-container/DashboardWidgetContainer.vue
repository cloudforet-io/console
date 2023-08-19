<template>
    <div ref="containerRef"
         class="dashboard-widget-container"
    >
        <template v-if="!dashboardDetailState.loadingDashboard">
            <template v-for="(widget) in reformedWidgetInfoList"
                      :key="widget.widget_key"
            >
                <component :is="widget.component"
                           :id="widget.widget_key"
                           ref="widgetRef"
                           v-intersection-observer="handleIntersectionObserver"
                           :widget-config-id="widget.widget_name"
                           :widget-key="widget.widget_key"
                           :title="widget.title"
                           :options="widget.widget_options"
                           :inherit-options="widget.inherit_options"
                           :size="widget.size"
                           :width="widget.width"
                           :theme="widget.theme"
                           :currency-rates="state.currencyRates"
                           :edit-mode="editMode"
                           :error-mode="editMode && dashboardDetailState.widgetValidMap[widget.widget_key] === false"
                           :all-reference-type-info="allReferenceTypeInfo"
                           :initiated="!!state.initiatedWidgetMap[widget.widget_key]"
                />
            </template>
        </template>
        <widget-view-mode-modal :visible="dashboardDetailState.widgetViewModeModalVisible"
                                @refresh-widget="handleRefreshWidget"
        />
    </div>
</template>

<script lang="ts" setup>
import { vIntersectionObserver } from '@vueuse/components';
import {
    debounce, isEmpty, isEqual,
} from 'lodash';
import type { ComponentPublicInstance } from 'vue';
import {
    reactive, ref, onMounted, watch, computed, toRef,
} from 'vue';
import { useStore } from 'vuex';

import type { AllReferenceTypeInfo } from '@/store/modules/reference/type';

import {
    useContainerWidth,
} from '@/services/dashboards/shared/dashboard-widget-container/composables/use-container-width';
import {
    useWidgetReformer,
} from '@/services/dashboards/shared/dashboard-widget-container/composables/use-widget-reformer';
import {
    useWidgetValidator,
} from '@/services/dashboards/shared/dashboard-widget-container/composables/use-widget-validator';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import WidgetViewModeModal from '@/services/dashboards/widgets/_components/WidgetViewModeModal.vue';
import type {
    WidgetExpose, WidgetProps,
} from '@/services/dashboards/widgets/_configs/config';


interface Props {
    editMode?: boolean;
    reusePreviousData?: boolean;
}
type WidgetComponent = ComponentPublicInstance<WidgetProps, WidgetExpose>;

const props = withDefaults(defineProps<Props>(), {
    editMode: false,
    reusePreviousData: false,
});
const store = useStore();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

const widgetRef = ref<WidgetComponent[]|null>([]);
const state = reactive({
    initiatedWidgetMap: {} as Record<string, any>,
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => store.getters['reference/allReferenceTypeInfo']),
    currencyRates: computed(() => store.state.settings.currencyRates),
});

/* container width */
const containerRef = ref<HTMLElement|null>(null);
const { containerWidth } = useContainerWidth({ containerRef, observeResize: true });

/* reform widget info list */
const { reformedWidgetInfoList, widgetConfigMap } = useWidgetReformer({
    dashboardWidgetInfoList: toRef(dashboardDetailState, 'dashboardWidgetInfoList'),
    containerWidth,
});

/* widget validation */
useWidgetValidator({
    validateOnVariablesSchemaChange: computed(() => !!props.editMode),
    dashboardWidgetInfoList: reformedWidgetInfoList,
    widgetConfigMap,
    variablesSchema: toRef(dashboardDetailState, 'variablesSchema'),
    updateWidgetValidMap: (validMap) => {
        dashboardDetailStore.$patch((_state) => {
            _state.widgetValidMap = validMap;
        });
    },
});

/* init widgets */
const handleIntersectionObserver = async ([{ isIntersecting, target }]) => {
    if (state.initiatedWidgetMap[target.id]) return;
    if (isIntersecting) {
        const targetWidgetRef = (widgetRef.value ?? []).find((d) => d?.$el?.id === target.id);
        if (typeof targetWidgetRef?.initWidget === 'function') {
            const prevData = props.reusePreviousData ? dashboardDetailState.widgetDataMap[target.id] : undefined;
            const data = await targetWidgetRef.initWidget(prevData);
            dashboardDetailStore.$patch((_state) => {
                _state.widgetDataMap[target.id] = data;
            });
            state.initiatedWidgetMap[target.id] = data;
        }
    }
};
watch(reformedWidgetInfoList, (widgetInfoList) => {
    if (!Array.isArray(widgetInfoList)) return;
    const initiatedWidgetMap = {};
    widgetInfoList.forEach((widget) => {
        initiatedWidgetMap[widget.widget_key] = state.initiatedWidgetMap[widget.widget_key];
    });
    state.initiatedWidgetMap = initiatedWidgetMap;
}, { immediate: true, deep: true });


/* refresh widgets */
let dashboardChangedTime;
watch(() => dashboardDetailState.dashboardId, () => {
    state.initiatedWidgetMap = {};
    dashboardChangedTime = new Date().getTime();
});
watch(() => dashboardDetailState.settings, (dashboardSettings, prevSettings) => {
    // escape if there is no initiated widget
    if (isEmpty(state.initiatedWidgetMap)) return;

    // escape if just initiated
    if (new Date().getTime() - dashboardChangedTime < 300) return;

    // refresh if date range is changed
    if (!isEqual(dashboardSettings.date_range, prevSettings?.date_range)) {
        refreshAllWidget();
    }
});
const handleRefreshWidget = (widgetKey: string) => {
    const targetWidgetRef = widgetRef.value?.find((d) => d?.$el?.id === widgetKey);
    targetWidgetRef?.refreshWidget();
};
const refreshAllWidget = debounce(async () => {
    dashboardDetailStore.$patch({ loadingWidgets: true });
    const refreshWidgetPromises: WidgetExpose['refreshWidget'][] = [];

    const filteredRefs = (widgetRef.value ?? []).filter((comp) => {
        if (!comp || typeof comp.refreshWidget() !== 'function') return false;
        if (!state.initiatedWidgetMap[comp.$el?.id]) return false;
        refreshWidgetPromises.push(comp.refreshWidget);
        return true;
    });

    const results = await Promise.allSettled(refreshWidgetPromises);

    results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
            const widgetKey = filteredRefs[idx]?.$el?.id;
            if (widgetKey) {
                dashboardDetailStore.$patch((_state) => {
                    _state.widgetDataMap[widgetKey] = result.value;
                });
            }
        }
    });
    dashboardDetailStore.$patch({ loadingWidgets: false });
}, 150);
defineExpose({
    refreshAllWidget,
});

/* init */
onMounted(async () => {
    await store.dispatch('reference/loadAll');
    // for PDF export
    // emit('rendered', state.widgetRef);
});

</script>

<style scoped>
.dashboard-widget-container {
    min-width: 320px;
    max-width: 1840px;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}
</style>
