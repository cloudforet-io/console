<script setup lang="ts">
import type { ComponentPublicInstance, AsyncComponent } from 'vue';
import {
    reactive, ref, watch, computed, onBeforeUnmount,
} from 'vue';

import { PDataLoader } from '@spaceone/design-system';
import { debounce, flattenDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { PrivateWidgetDeleteParameters } from '@/schema/dashboard/private-widget/api-verbs/delete';
import type { PrivateWidgetUpdateParameters } from '@/schema/dashboard/private-widget/api-verbs/update';
import type { PrivateWidgetModel } from '@/schema/dashboard/private-widget/model';
import type { PublicWidgetDeleteParameters } from '@/schema/dashboard/public-widget/api-verbs/delete';
import type { PublicWidgetUpdateParameters } from '@/schema/dashboard/public-widget/api-verbs/update';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';
import { store } from '@/store';

import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFormOverlay from '@/common/modules/widgets/_components/WidgetFormOverlay.vue';
import { getWidgetComponent } from '@/common/modules/widgets/_helpers/widget-component-helper';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import { widgetWidthAssigner } from '@/common/modules/widgets/_helpers/widget-width-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type {
    WidgetExpose, WidgetProps, WidgetSize, WidgetOverlayType,
} from '@/common/modules/widgets/types/widget-display-type';

import DashboardReorderSidebar from '@/services/dashboards/components/DashboardReorderSidebar.vue';
import {
    useDashboardContainerWidth,
} from '@/services/dashboards/composables/use-dashboard-container-width';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


type WidgetComponent = ComponentPublicInstance<WidgetProps, WidgetExpose>;
type WidgetModel = PublicWidgetModel|PrivateWidgetModel;
type RefinedWidgetInfo = WidgetModel & {
    size: WidgetSize;
    width?: number;
    component: AsyncComponent|null;
};

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailGetters = dashboardDetailStore.getters;
const dashboardDetailState = dashboardDetailStore.state;
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

/* State */
const containerRef = ref<HTMLElement|null>(null);
const widgetRef = ref<Array<WidgetComponent|null>>([]);
const state = reactive({
    mountedWidgetMap: {} as Record<string, boolean>,
    intersectedWidgetMap: {} as Record<string, boolean>,
    isAllWidgetsMounted: computed<boolean>(() => Object.values(state.mountedWidgetMap).every((d) => d)),
    refinedWidgetInfoList: computed<RefinedWidgetInfo[]>(() => {
        if (!dashboardDetailState.dashboardWidgets.length) return [];
        return getRefinedWidgetInfoList();
    }),
    overlayType: 'EDIT' as 'EDIT' | 'EXPAND',
    showExpandOverlay: false,
    vars: computed<Record<string, string[]>>(() => {
        const _vars: Record<string, string[]> = {};
        Object.entries(dashboardDetailState.variables).forEach(([k, v]) => {
            const idKey = MANAGED_VARIABLE_MODELS[k]?.meta.idKey;
            if (idKey) _vars[idKey] = v;
        });
        return _vars;
    }),
});
const widgetDeleteState = reactive({
    visibleModal: false,
    targetWidget: null as RefinedWidgetInfo|null,
});


/* Util */
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
            const _size = _widget.size || config.meta.sizes[0];
            _refinedWidgets.push({
                ..._widget,
                size: _size,
                component: getWidgetComponent(_widget.widget_type),
            });
            _widgetSizeList.push(_size);
        });
    });

    // width
    const _widths = flattenDeep(widgetWidthAssigner(_widgetSizeList, containerWidth.value));
    _refinedWidgets.forEach((widget, idx) => {
        widget.width = _widths[idx];
    });
    return _refinedWidgets;
};
const getWidgetLoading = (widgetId: string) => {
    if (!dashboardDetailGetters.isAllVariablesInitialized) return true;
    if (!state.isAllWidgetsMounted) return true;
    // if (!state.intersectedWidgetMap[widgetId]) return true;
    if (widgetGenerateState.widgetId === widgetId) return true;
    return false;
};
const refreshAllWidget = debounce(async () => {
    dashboardDetailStore.setLoadingWidgets(true);
    const loadWidgetPromises: WidgetExpose['loadWidget'][] = [];

    widgetRef.value.forEach((comp) => {
        if (!comp || typeof comp.loadWidget() !== 'function') return false;
        loadWidgetPromises.push(comp.loadWidget);
        return true;
    });

    await Promise.allSettled(loadWidgetPromises);

    dashboardDetailStore.setLoadingWidgets(false);
}, 150);
const loadAWidget = async (widgetId: string) => {
    if (!widgetId) return;
    widgetRef.value.forEach((comp) => {
        if (!comp || comp.$el.id !== widgetId) return;
        if (typeof comp.loadWidget !== 'function') return;
        comp.loadWidget();
    });
};


/* Api */
const deleteWidget = async (widgetId: string) => {
    const isPrivate = dashboardDetailState.dashboardId?.startsWith('private');
    const fetcher = isPrivate
        ? SpaceConnector.clientV2.dashboard.privateWidget.delete<PrivateWidgetDeleteParameters>
        : SpaceConnector.clientV2.dashboard.publicWidget.delete<PublicWidgetDeleteParameters>;
    try {
        await fetcher({
            widget_id: widgetId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const updateWidget = async (widgetId: string, size: WidgetSize) => {
    const isPrivate = widgetId.startsWith('private');
    const fetcher = isPrivate
        ? SpaceConnector.clientV2.dashboard.privateWidget.update<PrivateWidgetUpdateParameters, PrivateWidgetModel>
        : SpaceConnector.clientV2.dashboard.publicWidget.update<PublicWidgetUpdateParameters, PublicWidgetModel>;
    try {
        await fetcher({
            widget_id: widgetId,
            size,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};


/* Event */
const handleClickDeleteWidget = (widget: RefinedWidgetInfo) => {
    widgetDeleteState.targetWidget = widget;
    widgetDeleteState.visibleModal = true;
};
const handleOpenWidgetOverlay = (widget: RefinedWidgetInfo, overlayType: WidgetOverlayType) => {
    widgetGenerateStore.setOverlayType(overlayType);
    widgetGenerateStore.setWidgetForm(widget);
    widgetGenerateStore.setOverlayStep(2);
    widgetGenerateStore.setShowOverlay(true);
};
const handleToggleWidgetSize = async (widget: RefinedWidgetInfo, size: WidgetSize) => {
    const _widget = dashboardDetailState.dashboardWidgets.find((w) => w.widget_id === widget.widget_id);
    if (!_widget) return;
    await updateWidget(widget.widget_id, size);
    await dashboardDetailStore.listDashboardWidgets();
};
const handleWidgetMounted = (widgetId: string) => {
    state.mountedWidgetMap = {
        ...state.mountedWidgetMap,
        [widgetId]: true,
    };
};
// eslint-disable-next-line no-undef
const handleIntersectionObserver: IntersectionObserverCallback = async ([{ isIntersecting, target }], observer) => {
    if (isIntersecting) {
        if (state.isAllWidgetsMounted) {
            state.intersectedWidgetMap[target.id] = true;
            state.intersectedWidgetMap = { ...state.intersectedWidgetMap };
            observer.unobserve(target);
        }
    }
};
const handleDeleteModalConfirm = async () => {
    const _targetWidgetId = widgetDeleteState.targetWidget?.widget_id as string;
    // 1. remove from dashboard layouts
    await dashboardDetailStore.deleteDashboardWidget(_targetWidgetId);
    // 2. delete widget
    await deleteWidget(_targetWidgetId);
    // 3. delete widget from mounted map
    delete state.mountedWidgetMap[_targetWidgetId];
    state.mountedWidgetMap = { ...state.mountedWidgetMap };
    // 3. close modal
    await dashboardDetailStore.listDashboardWidgets();
    widgetDeleteState.visibleModal = false;
    widgetDeleteState.targetWidget = null;
};


/* Watcher */
watch(() => dashboardDetailState.dashboardId, (dashboardId) => {
    if (dashboardId) dashboardDetailStore.listDashboardWidgets();
}, { immediate: true });
watch(() => widgetGenerateState.showOverlay, async (showOverlay) => {
    if (!showOverlay && widgetGenerateState.overlayType !== 'EXPAND') {
        await dashboardDetailStore.listDashboardWidgets();
        await loadAWidget(widgetGenerateState.latestWidgetId);
    }
});
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
defineExpose({
    refreshAllWidget,
});
</script>

<template>
    <div ref="containerRef"
         class="dashboard-widget-container"
    >
        <p-data-loader :loading="dashboardDetailState.loadingDashboard"
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
                               :mode="store.state.display.visibleSidebar ? 'edit-layout' : 'view'"
                               :loading="getWidgetLoading(widget.widget_id)"
                               :dashboard-options="dashboardDetailState.options"
                               :dashboard-variables="dashboardDetailState.variables"
                               :vars="state.vars"
                               :disable-refresh-on-variable-change="widgetGenerateState.showOverlay"
                               @mounted="handleWidgetMounted(widget.widget_id)"
                               @click-edit="handleOpenWidgetOverlay(widget, 'EDIT')"
                               @click-delete="handleClickDeleteWidget(widget)"
                               @click-expand="handleOpenWidgetOverlay(widget, 'EXPAND')"
                               @toggle-size="handleToggleWidgetSize(widget, $event)"
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
        <widget-form-overlay />
        <dashboard-reorder-sidebar
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
