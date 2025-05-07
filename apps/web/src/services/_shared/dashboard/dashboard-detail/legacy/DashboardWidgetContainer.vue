<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue';
import {
    reactive, ref, watch, computed, onBeforeUnmount, nextTick,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { debounce } from 'lodash';

import { PDataLoader } from '@cloudforet/mirinae';

import type { DashboardLayoutWidgetInfo } from '@/api-clients/dashboard/_types/dashboard-type';

import { useDashboardContainerWidth } from '@/services/_shared/dashboard/dashboard-detail/composables/use-dashboard-container-width';
import { useDashboardGetQuery } from '@/services/_shared/dashboard/dashboard-detail/composables/use-dashboard-get-query';
import type { ReformedWidgetInfo } from '@/services/_shared/dashboard/dashboard-detail/composables/use-reformed-widget-info-list';
import { useReformedWidgetInfoList } from '@/services/_shared/dashboard/dashboard-detail/composables/use-reformed-widget-info-list';
import { getDashboardWidgetInfoList } from '@/services/_shared/dashboard/dashboard-detail/helpers/dashboard-widget-info-helper';
import type { WidgetFrameProps } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_components/WidgetFrame.vue';
import type { WidgetExpose } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';
import { useDashboardDetailInfoStore } from '@/services/_shared/dashboard/dashboard-detail/stores/dashboard-detail-info-store';
import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';
import { useAllReferenceTypeInfoStore } from '@/services/dashboards/stores/all-reference-type-info-store';



type WidgetComponent = ComponentPublicInstance<WidgetFrameProps, WidgetExpose>;

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailGetters = dashboardDetailStore.getters;
const dashboardDetailState = dashboardDetailStore.state;
const route = useRoute();
const dashboardId = computed(() => route.params.dashboardId);
const { dashboard } = useDashboardGetQuery({
    dashboardId,
});

const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();

const state = reactive({
    mountedWidgetMap: {} as Record<string, boolean>,
    intersectedWidgetMap: {} as Record<string, boolean>,
    initiatedWidgetMap: {} as Record<string, boolean>,
    isAllWidgetsMounted: computed(() => Object.values(state.mountedWidgetMap).every((d) => d)),
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
});

/* container width */
const containerRef = ref<HTMLElement|null>(null);
const { containerWidth } = useDashboardContainerWidth({ containerRef, observeResize: true });

/* reform widget info list */
const { reformedWidgetInfoList } = useReformedWidgetInfoList({
    dashboardWidgetInfoList: computed(() => getDashboardWidgetInfoList((dashboard.value?.layouts?.[0].widgets as DashboardLayoutWidgetInfo[]) || [])),
    containerWidth,
});

/* widget loading */
const getWidgetLoading = (widgetKey: string) => {
    if (!dashboardDetailGetters.isAllVariablesInitialized) return true;
    if (!state.isAllWidgetsMounted) return true;
    if (!state.intersectedWidgetMap[widgetKey]) return true;
    if (widgetFullModeState.targetWidget?.widget_key === widgetKey) return true;
    return false;
};


/* Widget intersection observer */
const widgetRef = ref<Array<WidgetComponent|null>>([]);
let widgetObserverMap: Record<string, IntersectionObserver> = {};
const stopWidgetRefWatch = watch([widgetRef, () => state.isAllWidgetsMounted], ([widgetRefs, allMounted]) => {
    if (widgetObserverMap) {
        Object.values(widgetObserverMap).forEach((observer) => observer.disconnect());
        widgetObserverMap = {};
    }

    if (!allMounted) return;

    widgetRefs.forEach((widget) => {
        if (!widget) return;
        const observer = new IntersectionObserver(handleIntersectionObserver, {
            threshold: 0.25,
        });
        widgetObserverMap[widget.$el.id] = observer;
        observer.observe(widget.$el);
    });
});
onBeforeUnmount(() => {
    stopWidgetRefWatch();
    Object.values(widgetObserverMap).forEach((observer) => observer.disconnect());
});
// eslint-disable-next-line no-undef
const handleIntersectionObserver: IntersectionObserverCallback = async ([{ isIntersecting, target }], observer) => {
    if (isIntersecting) {
        if (state.isAllWidgetsMounted) {
            state.intersectedWidgetMap[target.id] = true;
            observer.unobserve(target);
        }
    }
};

/* Widget event handlers */
const handleWidgetMounted = (widgetKey: string) => {
    state.mountedWidgetMap[widgetKey] = true;
};
const handleClickWidgetExpand = (widget: ReformedWidgetInfo) => {
    widgetFullModeState.targetWidget = widget;
    widgetFullModeState.visibleFullMode = true;
};

/* init states */
const stopWidgetInfoWatch = watch(reformedWidgetInfoList, (widgetInfoList) => {
    if (!Array.isArray(widgetInfoList)) return;

    const mountedWidgetMap = {};
    const intersectedWidgetMap = {};
    widgetInfoList.forEach((widget) => {
        mountedWidgetMap[widget.widget_key] = state.mountedWidgetMap[widget.widget_key];
        intersectedWidgetMap[widget.widget_key] = state.intersectedWidgetMap[widget.widget_key];
    });
    state.mountedWidgetMap = mountedWidgetMap;
    state.intersectedWidgetMap = intersectedWidgetMap;
}, {
    immediate: true, deep: true,
});
onBeforeUnmount(() => {
    stopWidgetInfoWatch();
});


/* refresh widgets */
const refreshAllWidget = debounce(async () => {
    dashboardDetailStore.setLoadingWidgets(true);
    const refreshWidgetPromises: WidgetExpose['refreshWidget'][] = [];

    widgetRef.value.forEach((comp) => {
        if (!comp || typeof comp.refreshWidget() !== 'function') return false;
        if (!state.initiatedWidgetMap[comp.$el?.id]) return false;
        refreshWidgetPromises.push(comp.refreshWidget);
        return true;
    });

    await Promise.allSettled(refreshWidgetPromises);

    dashboardDetailStore.setLoadingWidgets(false);
}, 150);
defineExpose({
    refreshAllWidget,
});

/* widget full mode */
const widgetFullModeState = reactive({
    visibleFullMode: false,
    targetWidget: null as ReformedWidgetInfo|null,
});
const handleUpdateViewModalVisible = async (visible: boolean) => {
    widgetFullModeState.visibleFullMode = visible;
    if (visible) return;

    const widgetKey = widgetFullModeState.targetWidget?.widget_key;
    const foundWidgetRef = widgetRef.value.find((comp) => comp?.$el.id === widgetKey);
    if (foundWidgetRef) {
        await nextTick();
        foundWidgetRef.refreshWidget();
    }
    widgetFullModeState.targetWidget = null;
};
</script>

<template>
    <div ref="containerRef"
         class="dashboard-widget-container"
    >
        <p-data-loader :loading="dashboardDetailState.loadingDashboard && !state.isAllWidgetsMounted"
                       :data="true"
                       disable-empty-case
        >
            <div class="widgets-wrapper">
                <template v-for="(widget) in reformedWidgetInfoList">
                    <component :is="widget.component"
                               :id="widget.widget_key"
                               :key="widget.widget_key"
                               ref="widgetRef"
                               :widget-config-id="widget.widget_name"
                               :widget-key="widget.widget_key"
                               :title="widget.title"
                               :options="widget.widget_options"
                               :inherit-options="widget.inherit_options"
                               :schema-properties="widget.schema_properties"
                               :size="widget.size"
                               :width="widget.width"
                               :theme="widget.theme"
                               :all-reference-type-info="state.allReferenceTypeInfo"
                               :disable-refresh-on-variable-change="widgetFullModeState.visibleFullMode"
                               :dashboard-options="dashboardDetailState.options"
                               :dashboard-variables-schema="dashboardDetailGetters.refinedVariablesSchema"
                               :dashboard-variables="dashboardDetailState.variables"
                               :loading="getWidgetLoading(widget.widget_key)"
                               @mounted="handleWidgetMounted(widget.widget_key)"
                               @click-expand="handleClickWidgetExpand(widget)"
                    />
                </template>
            </div>
        </p-data-loader>
        <widget-full-mode-modal v-if="widgetFullModeState.visibleFullMode"
                                :visible="widgetFullModeState.visibleFullMode"
                                :widget-key="widgetFullModeState.targetWidget?.widget_key"
                                :size="widgetFullModeState.targetWidget?.size"
                                :theme="widgetFullModeState.targetWidget?.theme"
                                @update:visible="handleUpdateViewModalVisible"
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
    .widgets-wrapper {
        display: flex;
        height: 100%;
        width: 100%;
        overflow: hidden;
        flex-wrap: wrap;
        gap: 1rem;
    }
}
</style>
