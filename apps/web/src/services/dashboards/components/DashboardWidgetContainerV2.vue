<script setup lang="ts">
import type { ComponentPublicInstance, AsyncComponent } from 'vue';
import {
    reactive, ref, watch, computed, onBeforeUnmount,
} from 'vue';

import { PDataLoader, PEmpty, PButton } from '@spaceone/design-system';
import { debounce, flattenDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { PrivateWidgetDeleteParameters } from '@/schema/dashboard/private-widget/api-verbs/delete';
import type { PrivateWidgetUpdateParameters } from '@/schema/dashboard/private-widget/api-verbs/update';
import type { PrivateWidgetModel } from '@/schema/dashboard/private-widget/model';
import type { PublicWidgetDeleteParameters } from '@/schema/dashboard/public-widget/api-verbs/delete';
import type { PublicWidgetUpdateParameters } from '@/schema/dashboard/public-widget/api-verbs/update';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';
import { store } from '@/store';

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
import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';
import {
    useAllReferenceTypeInfoStore,
} from '@/services/dashboards/stores/all-reference-type-info-store';
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
const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();

/* State */
const containerRef = ref<HTMLElement|null>(null);
const widgetRef = ref<Array<WidgetComponent|null>>([]);
const state = reactive({
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
    mountedWidgetMap: {} as Record<string, boolean>,
    intersectedWidgetMap: {} as Record<string, boolean>,
    isAllWidgetsMounted: computed<boolean>(() => Object.values(state.mountedWidgetMap).every((d) => d)),
    refinedWidgetInfoList: computed<RefinedWidgetInfo[]>(() => {
        if (!dashboardDetailState.dashboardWidgets.length) return [];
        return getRefinedWidgetInfoList();
    }),
    overlayType: 'EDIT' as 'EDIT' | 'EXPAND',
    showExpandOverlay: false,
    remountWidgetId: undefined as string|undefined,
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
            const _config = getWidgetConfig(_widget.widget_type);
            if (!_config) return;
            const _size = _widget.size || _config.meta.sizes[0];
            const _component = getWidgetComponent(_widget.widget_type);
            if (!_component) return;
            _refinedWidgets.push({
                ..._widget,
                size: _size,
                component: _component,
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
const handleClickAddWidget = () => {
    widgetGenerateStore.setOverlayType('ADD');
    widgetGenerateStore.setShowOverlay(true);
};


/* Watcher */
watch(() => dashboardDetailState.dashboardId, (dashboardId) => {
    if (dashboardId) dashboardDetailStore.listDashboardWidgets();
}, { immediate: true });
watch(() => widgetGenerateState.showOverlay, async (showOverlay) => {
    if (!showOverlay && widgetGenerateState.overlayType !== 'EXPAND') {
        state.remountWidgetId = widgetGenerateState.latestWidgetId;
        await dashboardDetailStore.listDashboardWidgets();
        state.remountWidgetId = undefined;
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
                       :data="state.refinedWidgetInfoList"
        >
            <div class="widgets-wrapper">
                <template v-for="(widget) in state.refinedWidgetInfoList">
                    <component :is="widget.component"
                               v-if="widget.widget_id !== state.remountWidgetId"
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
                               :dashboard-vars="dashboardDetailGetters.refinedVars"
                               :disable-refresh-on-variable-change="widgetGenerateState.showOverlay"
                               :disable-manage-buttons="dashboardDetailGetters.disableManageButtons"
                               :all-reference-type-info="state.allReferenceTypeInfo"
                               @mounted="handleWidgetMounted(widget.widget_id)"
                               @click-edit="handleOpenWidgetOverlay(widget, 'EDIT')"
                               @click-delete="handleClickDeleteWidget(widget)"
                               @click-expand="handleOpenWidgetOverlay(widget, 'EXPAND')"
                               @toggle-size="handleToggleWidgetSize(widget, $event)"
                    />
                </template>
            </div>
            <template #no-data>
                <div class="no-data-wrapper">
                    <p-empty show-image
                             image-size="sm"
                             class="empty-wrapper"
                             show-button
                    >
                        {{ $t('DASHBOARDS.DETAIL.NO_WIDGET_TEXT') }}
                        <template #button>
                            <p-button v-if="!dashboardDetailGetters.disableManageButtons"
                                      style-type="substitutive"
                                      icon-left="ic_plus_bold"
                                      class="add-widget-button"
                                      @click="handleClickAddWidget"
                            >
                                {{ $t('DASHBOARDS.DETAIL.ADD_WIDGET') }}
                            </p-button>
                        </template>
                    </p-empty>
                </div>
            </template>
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
    gap: 0.5rem;
    .no-data-wrapper {
        padding-top: 3.5rem;
    }
    .widgets-wrapper {
        display: flex;
        height: 100%;
        width: 100%;
        overflow: hidden;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
}
</style>
