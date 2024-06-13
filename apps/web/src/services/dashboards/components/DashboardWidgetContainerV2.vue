<script setup lang="ts">
import type { ComponentPublicInstance, AsyncComponent } from 'vue';
import {
    reactive, ref, watch, computed, onBeforeUnmount,
} from 'vue';

import { PDataLoader } from '@spaceone/design-system';
import { debounce, flattenDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFormOverlay from '@/common/modules/widgets/_components/WidgetFormOverlay.vue';
import { getWidgetComponent } from '@/common/modules/widgets/_helpers/widget-component-helper';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { WidgetExpose, WidgetProps, WidgetSize } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetModel } from '@/common/modules/widgets/types/widget-model';

import DashboardCustomizeSidebar from '@/services/dashboards/components/DashboardCustomizeSidebar.vue';
import {
    useDashboardContainerWidth,
} from '@/services/dashboards/composables/use-dashboard-container-width';
import { widgetWidthAssigner } from '@/services/dashboards/helpers/widget-width-helper';
import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';
import { useAllReferenceTypeInfoStore } from '@/services/dashboards/stores/all-reference-type-info-store';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


type WidgetComponent = ComponentPublicInstance<WidgetProps, WidgetExpose>;

interface RefinedWidgetInfo extends WidgetModel {
    size: WidgetSize;
    width?: number;
    component: AsyncComponent|null;
}

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailGetters = dashboardDetailStore.getters;
const dashboardDetailState = dashboardDetailStore.state;
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;
const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();

const state = reactive({
    mountedWidgetMap: {} as Record<string, boolean>,
    intersectedWidgetMap: {} as Record<string, boolean>,
    initiatedWidgetMap: {} as Record<string, boolean>,
    isAllWidgetsMounted: computed(() => Object.values(state.mountedWidgetMap).every((d) => d)),
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
    refinedWidgetInfoList: computed<RefinedWidgetInfo[]>(() => {
        if (!dashboardDetailState.dashboardWidgets.length) return [];
        return getRefinedWidgetInfoList();
    }),
});


/* Widget Display */
const containerRef = ref<HTMLElement|null>(null);
const { containerWidth } = useDashboardContainerWidth({ containerRef, observeResize: true });
const getRefinedWidgetInfoList = (): RefinedWidgetInfo[] => {
    const _refinedWidgets: RefinedWidgetInfo[] = [];
    const _widgetSizeList: WidgetSize[] = [];
    dashboardDetailState.dashboardLayouts.forEach((d) => {
        const _widgetIdList = d.widgets;
        _widgetIdList?.forEach((widgetId) => {
            const _widget = dashboardDetailState.dashboardWidgets.find((w) => w.widget_id === widgetId);
            if (!_widget) return;
            const config = getWidgetConfig(_widget.widget_type);
            if (!config) return;
            _refinedWidgets.push({
                ..._widget,
                size: config.meta.sizes[0],
                component: getWidgetComponent(_widget.widget_type),
            });
            _widgetSizeList.push(config.meta.sizes[0]);
        });
    });

    // width
    const _widths = flattenDeep(widgetWidthAssigner(_widgetSizeList, containerWidth.value));
    _refinedWidgets.forEach((widget, idx) => {
        widget.width = _widths[idx];
    });
    return _refinedWidgets;
};

/* Api */
const deleteWidget = async (widgetId: string) => {
    try {
        await SpaceConnector.clientV2.dashboard.publicWidget.delete({
            widget_id: widgetId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

/* widget loading */
const getWidgetLoading = (widgetId: string) => {
    if (!dashboardDetailGetters.isAllVariablesInitialized) return true;
    if (!state.isAllWidgetsMounted) return true;
    // if (!state.intersectedWidgetMap[widgetId]) return true; // HACK: Currently, interceptWidgetMap is not working properly. Need to be fixed.
    if (widgetGenerateState.widgetId === widgetId) return true;
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
const handleWidgetMounted = (widgetId: string) => {
    state.mountedWidgetMap[widgetId] = true;
};
const handleClickDeleteWidget = (widget: RefinedWidgetInfo) => {
    widgetDeleteState.targetWidget = widget;
    widgetDeleteState.visibleModal = true;
};
const handleOpenWidgetOverlay = (widget: RefinedWidgetInfo) => {
    widgetGenerateStore.setWidgetForm(widget);
    widgetGenerateStore.setOverlayStep(2);
    widgetGenerateStore.setShowOverlay(true);
};

/* init states */
const stopWidgetInfoWatch = watch(state.refinedWidgetInfoList, (widgetInfoList) => {
    if (!Array.isArray(widgetInfoList)) return;

    const mountedWidgetMap = {};
    const intersectedWidgetMap = {};
    widgetInfoList.forEach((widget) => {
        mountedWidgetMap[widget.widget_id] = state.mountedWidgetMap[widget.widget_id];
        intersectedWidgetMap[widget.widget_id] = state.intersectedWidgetMap[widget.widget_id];
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
    const loadWidgetPromises: WidgetExpose['loadWidget'][] = [];

    widgetRef.value.forEach((comp) => {
        if (!comp || typeof comp.loadWidget() !== 'function') return false;
        if (!state.initiatedWidgetMap[comp.$el?.id]) return false;
        loadWidgetPromises.push(comp.loadWidget);
        return true;
    });

    await Promise.allSettled(loadWidgetPromises);

    dashboardDetailStore.setLoadingWidgets(false);
}, 150);
defineExpose({
    refreshAllWidget,
});

/* widget delete modal */
const widgetDeleteState = reactive({
    visibleModal: false,
    targetWidget: null as RefinedWidgetInfo|null,
});
const handleDeleteModalConfirm = async () => {
    // 1. remove from dashboard layouts
    await dashboardDetailStore.deleteDashboardWidget(widgetDeleteState.targetWidget?.widget_id);
    // 2. delete widget
    await deleteWidget(widgetDeleteState.targetWidget?.widget_id as string);
    // 3. close modal
    widgetDeleteState.visibleModal = false;
    widgetDeleteState.targetWidget = null;
};

/* Watcher */
watch(() => dashboardDetailState.dashboardId, (dashboardId) => {
    if (dashboardId) dashboardDetailStore.listDashboardWidgets();
}, { immediate: true });
watch(() => widgetGenerateState.showOverlay, (showOverlay) => {
    if (!showOverlay) {
        refreshAllWidget();
    }
});
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
                <template v-for="(widget) in state.refinedWidgetInfoList">
                    <component :is="widget.component"
                               :id="widget.widget_id"
                               :key="widget.widget_id"
                               ref="widgetRef"
                               :widget-name="widget.widget_type"
                               :widget-id="widget.widget_id"
                               :data-table-id="widget.data_table_id"
                               :title="widget.name"
                               :description="widget.description"
                               :size="widget.size"
                               :width="widget.width"
                               :widget-options="widget.options"
                               mode="view"
                               :loading="getWidgetLoading(widget.widget_id)"
                               :dashboard-options="dashboardDetailState.options"
                               :dashboard-variables="dashboardDetailState.variables"
                               :disable-refresh-on-variable-change="widgetGenerateState.showOverlay"
                               @mounted="handleWidgetMounted(widget.widget_id)"
                               @click-edit="handleOpenWidgetOverlay(widget)"
                               @click-delete="handleClickDeleteWidget(widget)"
                    />
                </template>
            </div>
        </p-data-loader>
        <delete-modal :visible="widgetDeleteState.visibleModal"
                      :header-title="$t('DASHBOARDS.WIDGET.DELETE_TITLE')"
                      :contents="$t('DASHBOARDS.WIDGET.DELETE_CONTENTS')"
                      @update:visible="widgetDeleteState.visibleModal = $event"
                      @confirm="handleDeleteModalConfirm"
        />
        <widget-form-overlay overlay-type="EDIT" />
        <dashboard-customize-sidebar
            :widget-info-list="state.refinedWidgetInfoList"
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
