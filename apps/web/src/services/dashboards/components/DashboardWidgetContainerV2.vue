<script setup lang="ts">
import type { ComponentPublicInstance, AsyncComponent } from 'vue';
import {
    reactive, ref, watch, computed, onBeforeUnmount, onMounted,
} from 'vue';

import { PDataLoader } from '@spaceone/design-system';
import { debounce, flattenDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PrivateWidgetModel } from '@/schema/dashboard/private-widget/model';
import type { PublicWidgetListParameters } from '@/schema/dashboard/public-widget/api-verbs/list';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFormOverlay from '@/common/modules/widgets/_components/WidgetFormOverlay.vue';
import { getWidgetComponent } from '@/common/modules/widgets/_helpers/widget-component-helper';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { WidgetSize } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetModel } from '@/common/modules/widgets/types/widget-model';

import {
    useDashboardContainerWidth,
} from '@/services/dashboards/composables/use-dashboard-container-width';
import { widgetWidthAssigner } from '@/services/dashboards/helpers/widget-width-helper';
import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';
import { useAllReferenceTypeInfoStore } from '@/services/dashboards/stores/all-reference-type-info-store';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';
import type {
    UpdatableWidgetInfo,
    WidgetExpose, WidgetProps,
} from '@/services/dashboards/widgets/_types/widget-type';


type WidgetComponent = ComponentPublicInstance<WidgetProps, WidgetExpose>;

const props = defineProps<{
    editMode?: boolean;
}>();

interface RefinedWidgetInfo extends WidgetModel {
    size: WidgetSize;
    width: number;
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
    isAllWidgetsMounted: computed(() => Object.values(state.mountedWidgetMap).every((d) => d)),
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
    widgetList: [] as Array<PublicWidgetModel|PrivateWidgetModel>,
    refinedWidgetInfoList: computed<RefinedWidgetInfo[]>(() => getRefinedWidgetInfoList()),
});

/* Widget Display */
const containerRef = ref<HTMLElement|null>(null);
const { containerWidth } = useDashboardContainerWidth({ containerRef, observeResize: true });
const getRefinedWidgetInfoList = (): RefinedWidgetInfo[] => {
    // size
    const _sizes: WidgetSize[] = [];
    dashboardDetailState.dashboardWidgetInfoList.forEach((d) => {
        const _widget = state.widgetList.find((w) => w.widget_id === d.widget_id);
        if (!_widget) return;
        const config = getWidgetConfig(_widget.widget_type);
        _sizes.push(config.meta.sizes[0]);
    });

    // width
    const _widths = flattenDeep(widgetWidthAssigner(_sizes, containerWidth.value));

    // refine widgets
    const _refinedWidgets: RefinedWidgetInfo[] = [];
    dashboardDetailState.dashboardWidgetInfoList.forEach((widget, idx) => {
        const _widget = state.widgetList.find((w) => w.widget_id === widget.widget_id);
        if (!_widget) return;
        _refinedWidgets.push({
            ..._widget,
            size: _sizes[idx],
            width: _widths[idx],
            component: getWidgetComponent(_widget.widget_type),
        });
    });
    return _refinedWidgets;
};

/* Api */
const listWidget = async () => {
    if (!dashboardDetailState.dashboardId) return;
    try {
        const { results } = await SpaceConnector.clientV2.dashboard.publicWidget.list<PublicWidgetListParameters, ListResponse<PublicWidgetModel>>({
            dashboard_id: dashboardDetailState.dashboardId,
        });
        state.widgetList = results;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

/* widget loading */
const getWidgetLoading = (widgetId: string) => {
    if (!dashboardDetailGetters.isAllVariablesInitialized) return true;
    if (!state.isAllWidgetsMounted) return true;
    if (!state.intersectedWidgetMap[widgetId]) return true;
    // if (widgetFullModeState.targetWidget?.widget_key === widgetKey) return true;
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
const handleUpdateWidgetInfo = (widgetId: string, widgetInfo: UpdatableWidgetInfo) => {
    dashboardDetailStore.updateWidgetInfo(widgetId, widgetInfo);
};
const handleUpdateValidation = (widgetId: string, isValid: boolean) => {
    dashboardDetailStore.updateWidgetValidation(isValid, widgetId);
};
const handleClickDeleteWidget = (widget: RefinedWidgetInfo) => {
    widgetDeleteState.targetWidget = widget;
    widgetDeleteState.visibleModal = true;
};
const handleOpenWidgetOverlay = (widget: RefinedWidgetInfo) => {
    widgetGenerateStore.initWidgetForm(widget);
    widgetGenerateStore.setOverlayStep(2);
    widgetGenerateStore.setShowOverlay(true);
};

/* init states */
// const stopWidgetInfoWatch = watch(reformedWidgetInfoList, (widgetInfoList) => {
//     if (!Array.isArray(widgetInfoList)) return;
//
//     const mountedWidgetMap = {};
//     const intersectedWidgetMap = {};
//     widgetInfoList.forEach((widget) => {
//         mountedWidgetMap[widget.widget_key] = state.mountedWidgetMap[widget.widget_key];
//         intersectedWidgetMap[widget.widget_key] = state.intersectedWidgetMap[widget.widget_key];
//     });
//     state.mountedWidgetMap = mountedWidgetMap;
//     state.intersectedWidgetMap = intersectedWidgetMap;
// }, {
//     immediate: true, deep: true,
// });

onMounted(() => {
    listWidget();
});
onBeforeUnmount(() => {
    // stopWidgetInfoWatch();
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

// const handleWidgetEditModalConfirm = async (widgetInfo: UpdatableWidgetInfo) => {
//     const widgetKey = widgetEditState.targetWidget?.widget_key;
//     if (!widgetKey || !widgetInfo) return;
//     dashboardDetailStore.updateWidgetInfo(widgetKey, widgetInfo);
//     dashboardDetailStore.updateWidgetValidation(true, widgetKey);
//     widgetEditState.visibleModal = false;
//     widgetEditState.targetWidget = null;
//     await nextTick(); // wait for updated widget info to be applied to the widget component's states
//     widgetRef.value.find((comp) => comp?.$el.id === widgetKey)?.refreshWidget();
// };

/* widget delete modal */
const widgetDeleteState = reactive({
    visibleModal: false,
    targetWidget: null as RefinedWidgetInfo|null,
});
const handleDeleteModalConfirm = () => {
    // const target = widgetDeleteState.targetWidget;
    // if (!target) return;
    // dashboardDetailStore.deleteWidget(target.widget_id);
    // widgetDeleteState.visibleModal = false;
    // widgetDeleteState.targetWidget = null;
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
                <template v-for="(widget) in state.refinedWidgetInfoList">
                    <component :is="widget.component"
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
                               :mode="props.editMode ? 'customize' : 'view'"
                               :loading="getWidgetLoading(widget.widget_id)"
                               :dashboard-options="dashboardDetailState.options"
                               :dashboard-variables="dashboardDetailState.variables"
                               :disable-refresh-on-variable-change="widgetGenerateState.showOverlay"
                               :data="{}"
                               @mounted="handleWidgetMounted(widget.widget_id)"
                               @update-widget-info="handleUpdateWidgetInfo(widget.widget_id, $event)"
                               @update-widget-validation="handleUpdateValidation(widget.widget_id, $event)"
                               @click-edit="handleOpenWidgetOverlay(widget)"
                               @click-delete="handleClickDeleteWidget(widget)"
                               @click-expand="handleOpenWidgetOverlay(widget)"
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
