<script setup lang="ts">
import { vIntersectionObserver } from '@vueuse/components';
import type { ComponentPublicInstance } from 'vue';
import {
    reactive, ref, onMounted, watch, computed, toRef,
} from 'vue';

import {
    debounce, isEmpty, isEqual,
} from 'lodash';

import { store } from '@/store';

import type { AllReferenceTypeInfo } from '@/store/modules/reference/type';

import {
    useContainerWidth,
} from '@/services/dashboards/shared/dashboard-widget-container/composables/use-container-width';
import {
    useWidgetReformer,
} from '@/services/dashboards/shared/dashboard-widget-container/composables/use-widget-reformer';
import WidgetViewModeModal from '@/services/dashboards/shared/dashboard-widget-container/WidgetViewModeModal.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import DashboardWidgetEditModal from '@/services/dashboards/widgets/_components/DashboardWidgetEditModal.vue';
import type {
    DashboardLayoutWidgetInfo,
    WidgetExpose, WidgetProps,
} from '@/services/dashboards/widgets/_configs/config';

type WidgetComponent = ComponentPublicInstance<WidgetProps, WidgetExpose>;

const props = withDefaults(defineProps<{
    editMode?: boolean;
    reusePreviousData?: boolean;
}>(), {
    editMode: false,
    reusePreviousData: false,
});


const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

const widgetRef = ref<Array<WidgetComponent|null>>([]);
const state = reactive({
    initiatedWidgetMap: {} as Record<string, any>,
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => store.getters['reference/allReferenceTypeInfo']),
    currencyRates: computed(() => store.state.settings.currencyRates),
});

/* container width */
const containerRef = ref<HTMLElement|null>(null);
const { containerWidth } = useContainerWidth({ containerRef, observeResize: true });

/* reform widget info list */
const { reformedWidgetInfoList } = useWidgetReformer({
    dashboardWidgetInfoList: toRef(dashboardDetailState, 'dashboardWidgetInfoList'),
    containerWidth,
});


/* init widgets */
const handleIntersectionObserver = async ([{ isIntersecting, target }]) => {
    if (state.initiatedWidgetMap[target.id]) return;
    if (isIntersecting) {
        const targetWidgetRef = widgetRef.value.find((d) => d?.$el?.id === target.id);
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
const handleWidgetRefreshed = (widgetKey: string, data: any) => {
    dashboardDetailStore.$patch((_state) => {
        _state.widgetDataMap[widgetKey] = data;
    });
};
const handleUpdateWidgetInfo = (widget: DashboardLayoutWidgetInfo, widgetInfo: Partial<DashboardLayoutWidgetInfo>) => {
    const originWidgetInfo = widget;
    dashboardDetailStore.updateWidgetInfo(originWidgetInfo.widget_key, { ...originWidgetInfo, ...widgetInfo });
};
const handleUpdateValidation = (widgetKey: string, isValid: boolean) => {
    dashboardDetailStore.updateWidgetValidation(widgetKey, isValid);
};
const handleClickWidgetEdit = (widget: DashboardLayoutWidgetInfo) => {
    widgetEditState.targetWidget = widget;
    widgetEditState.visibleModal = true;
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
    const targetWidgetRef = widgetRef.value.find((d) => d?.$el?.id === widgetKey);
    targetWidgetRef?.refreshWidget();
};
const refreshAllWidget = debounce(async () => {
    dashboardDetailStore.$patch({ loadingWidgets: true });
    const refreshWidgetPromises: WidgetExpose['refreshWidget'][] = [];

    const filteredRefs = widgetRef.value.filter((comp) => {
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

/* widget edit modal */
const widgetEditState = reactive({
    visibleModal: false,
    targetWidget: null as DashboardLayoutWidgetInfo|null,
});
const handleConformWidgetEditModal = () => {
    const target = widgetEditState.targetWidget;
    if (!target) return;
    const targetWidgetRef = widgetRef.value.find((d) => d?.$el?.id === target.widget_key);
    targetWidgetRef?.refreshWidget();
    widgetEditState.targetWidget = null;
};

/* init */
onMounted(async () => {
    await store.dispatch('reference/loadAll');
    // for PDF export
    // emit('rendered', widgetRef.value);
});

</script>

<template>
    <div ref="containerRef"
         class="dashboard-widget-container"
    >
        <template v-if="!dashboardDetailState.loadingDashboard">
            <template v-for="(widget) in reformedWidgetInfoList">
                <component :is="widget.component"
                           :id="widget.widget_key"
                           :key="widget.widget_key"
                           ref="widgetRef"
                           v-intersection-observer="handleIntersectionObserver"
                           :widget-config-id="widget.widget_name"
                           :widget-key="widget.widget_key"
                           :title="widget.title"
                           :options="widget.widget_options"
                           :inherit-options="widget.inherit_options"
                           :schema-properties="widget.schema_properties"
                           :size="widget.size"
                           :width="widget.width"
                           :theme="widget.theme"
                           :currency-rates="state.currencyRates"
                           :edit-mode="props.editMode"
                           :error-mode="props.editMode && dashboardDetailState.widgetValidMap[widget.widget_key] === false"
                           :all-reference-type-info="state.allReferenceTypeInfo"
                           :initiated="!!state.initiatedWidgetMap[widget.widget_key]"
                           :disable-refresh-on-variable-change="dashboardDetailState.widgetViewModeModalVisible"
                           :dashboard-settings="dashboardDetailState.settings"
                           :dashboard-variables-schema="dashboardDetailState.variablesSchema"
                           :dashboard-variables="dashboardDetailState.variables"
                           @refreshed="handleWidgetRefreshed(widget.widget_key, $event)"
                           @update-widget-info="handleUpdateWidgetInfo(widget, $event)"
                           @update-widget-validation="handleUpdateValidation(widget.widget_key, $event)"
                           @click-edit="handleClickWidgetEdit(widget)"
                />
                <!-- TODO: remove this comment after refactoring
                <component :is="widget.component"
                           :id="widget.widget_key"
                           :key="widget.widget_key"
                           ref="widgetRef"
                           v-intersection-observer="handleIntersectionObserver"
                           :widget-info="widget"
                           :edit-mode="editMode"
                           :error-mode="editMode && dashboardDetailState.widgetValidMap[widget.widget_key] === false"
                           :disable-refresh-on-variable-change="dashboardDetailState.widgetViewModeModalVisible && widget.widget_key !== widgetFormState.widgetKey"
                           :initiated="!!initiatedWidgetMap[widget.widget_key]"
                           :currency-rates="currencyRates"
                           :all-reference-type-info="allReferenceTypeInfo"
                           :settings="dashboardDetailState.settings"
                           :variables-schema="dashboardDetailState.variablesSchema"
                           :variables="dashboardDetailState.variables"
                           @refreshed="handleWidgetRefreshed(widget.widget_key, $event)"
                           @update-widget-info="handleUpdateWidgetInfo(widget.widget_key, $event)"
                           @update-widget-validation="handleUpdateValidation(widget.widget_key, $event)"
                />
                -->
            </template>
        </template>
        <widget-view-mode-modal :visible="dashboardDetailState.widgetViewModeModalVisible"
                                @refresh-widget="handleRefreshWidget"
        />
        <dashboard-widget-edit-modal v-if="widgetEditState.targetWidget"
                                     :widget-config-id="widgetEditState.targetWidget.widget_name"
                                     :visible="widgetEditState.visibleModal"
                                     :widget-key="widgetEditState.targetWidget.widget_key"
                                     @update:visible="widgetEditState.visibleModal = $event"
                                     @confirm="handleConformWidgetEditModal"
        />
    </div>
</template>

<style scoped>
.dashboard-widget-container {
    min-width: 320px;
    max-width: 1840px;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}
</style>
