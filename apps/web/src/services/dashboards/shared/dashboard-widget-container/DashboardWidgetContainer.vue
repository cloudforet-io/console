<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue';
import {
    reactive, ref, watch, computed, toRef, onBeforeUnmount, nextTick,
} from 'vue';

import { PDataLoader } from '@spaceone/design-system';
import { debounce } from 'lodash';

import type { AllReferenceTypeInfo } from '@/store/reference/all-reference-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';

import {
    useContainerWidth,
} from '@/services/dashboards/shared/dashboard-widget-container/composables/use-container-width';
import type { ReformedWidgetInfo } from '@/services/dashboards/shared/dashboard-widget-container/composables/use-widget-reformer';
import {
    useWidgetReformer,
} from '@/services/dashboards/shared/dashboard-widget-container/composables/use-widget-reformer';
import WidgetViewModeModal from '@/services/dashboards/shared/dashboard-widget-container/WidgetViewModeModal.vue';
import DashboardWidgetEditModal from '@/services/dashboards/shared/DashboardWidgetEditModal.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import type {
    UpdatableWidgetInfo,
    WidgetExpose, WidgetProps,
} from '@/services/dashboards/widgets/_configs/config';

type WidgetComponent = ComponentPublicInstance<WidgetProps, WidgetExpose>;

const props = withDefaults(defineProps<{
    editMode?: boolean;
}>(), {
    editMode: false,
});


const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

const allReferenceStore = useAllReferenceStore();

const state = reactive({
    mountedWidgetMap: {} as Record<string, boolean>,
    intersectedWidgetMap: {} as Record<string, boolean>,
    isAllWidgetsMounted: computed(() => Object.values(state.mountedWidgetMap).every((d) => d)),
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => allReferenceStore.getters.allReferenceTypeInfo),
});

/* container width */
const containerRef = ref<HTMLElement|null>(null);
const { containerWidth } = useContainerWidth({ containerRef, observeResize: true });

/* reform widget info list */
const { reformedWidgetInfoList } = useWidgetReformer({
    dashboardWidgetInfoList: toRef(dashboardDetailState, 'dashboardWidgetInfoList'),
    containerWidth,
});

/* widget loading */
const getWidgetLoading = (widgetKey: string) => {
    if (!dashboardDetailStore.isAllVariablesInitialized) return true;
    if (!state.isAllWidgetsMounted) return true;
    if (!state.intersectedWidgetMap[widgetKey]) return true;
    if (widgetViewState.targetWidget?.widget_key === widgetKey) return true;
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
const handleUpdateWidgetInfo = (widgetKey: string, widgetInfo: UpdatableWidgetInfo) => {
    dashboardDetailStore.updateWidgetInfo(widgetKey, widgetInfo);
};
const handleUpdateValidation = (widgetKey: string, isValid: boolean) => {
    dashboardDetailStore.updateWidgetValidation(isValid, widgetKey);
};
const handleClickWidgetEdit = (widget: ReformedWidgetInfo) => {
    widgetEditState.targetWidget = widget;
    widgetEditState.visibleModal = true;
};
const handleClickDeleteWidget = (widget: ReformedWidgetInfo) => {
    widgetDeleteState.targetWidget = widget;
    widgetDeleteState.visibleModal = true;
};
const handleClickWidgetExpand = (widget: ReformedWidgetInfo) => {
    if (props.editMode) {
        dashboardDetailStore.toggleWidgetSize(widget.widget_key);
    } else {
        widgetViewState.targetWidget = widget;
        widgetViewState.visibleModal = true;
    }
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
    dashboardDetailStore.$patch({ loadingWidgets: true });
    const refreshWidgetPromises: WidgetExpose['refreshWidget'][] = [];

    widgetRef.value.forEach((comp) => {
        if (!comp || typeof comp.refreshWidget() !== 'function') return false;
        if (!state.initiatedWidgetMap[comp.$el?.id]) return false;
        refreshWidgetPromises.push(comp.refreshWidget);
        return true;
    });

    await Promise.allSettled(refreshWidgetPromises);

    dashboardDetailStore.$patch({ loadingWidgets: false });
}, 150);
defineExpose({
    refreshAllWidget,
});

/* widget edit modal */
const widgetEditState = reactive({
    visibleModal: false,
    targetWidget: null as ReformedWidgetInfo|null,
});
const handleWidgetEditModalCancel = () => {
    widgetEditState.visibleModal = false;
};
const handleWidgetEditModalConfirm = async (widgetInfo: UpdatableWidgetInfo) => {
    const widgetKey = widgetEditState.targetWidget?.widget_key;
    if (!widgetKey || !widgetInfo) return;
    dashboardDetailStore.updateWidgetInfo(widgetKey, widgetInfo);
    dashboardDetailStore.updateWidgetValidation(true, widgetKey);
    widgetEditState.visibleModal = false;
    widgetEditState.targetWidget = null;
    await nextTick(); // wait for updated widget info to be applied to the widget component's states
    widgetRef.value.find((comp) => comp?.$el.id === widgetKey)?.refreshWidget();
};

/* widget delete modal */
const widgetDeleteState = reactive({
    visibleModal: false,
    targetWidget: null as ReformedWidgetInfo|null,
});
const handleDeleteModalConfirm = () => {
    const target = widgetDeleteState.targetWidget;
    if (!target) return;
    dashboardDetailStore.deleteWidget(target.widget_key);
    widgetDeleteState.visibleModal = false;
    widgetDeleteState.targetWidget = null;
};

/* widget edit modal */
const widgetViewState = reactive({
    visibleModal: false,
    targetWidget: null as ReformedWidgetInfo|null,
});
const handleUpdateViewModalVisible = (visible: boolean) => {
    widgetViewState.visibleModal = visible;
    if (visible) return;

    widgetViewState.targetWidget = null;
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
                               :edit-mode="props.editMode"
                               :error-mode="props.editMode && dashboardDetailState.widgetValidMap[widget.widget_key] === false"
                               :all-reference-type-info="state.allReferenceTypeInfo"
                               :disable-refresh-on-variable-change="widgetViewState.visibleModal"
                               :dashboard-settings="dashboardDetailState.settings"
                               :dashboard-variables-schema="dashboardDetailState.variablesSchema"
                               :dashboard-variables="dashboardDetailState.variables"
                               :loading="getWidgetLoading(widget.widget_key)"
                               @mounted="handleWidgetMounted(widget.widget_key)"
                               @update-widget-info="handleUpdateWidgetInfo(widget.widget_key, $event)"
                               @update-widget-validation="handleUpdateValidation(widget.widget_key, $event)"
                               @click-edit="handleClickWidgetEdit(widget)"
                               @click-delete="handleClickDeleteWidget(widget)"
                               @click-expand="handleClickWidgetExpand(widget)"
                    />
                </template>
            </div>
        </p-data-loader>
        <widget-view-mode-modal :visible="widgetViewState.visibleModal"
                                :widget-info="widgetViewState.targetWidget"
                                @update:visible="handleUpdateViewModalVisible"
        />
        <dashboard-widget-edit-modal v-if="widgetEditState.targetWidget"
                                     :widget-config-id="widgetEditState.targetWidget.widget_name"
                                     :visible="widgetEditState.visibleModal"
                                     :widget-key="widgetEditState.targetWidget.widget_key"
                                     @cancel="handleWidgetEditModalCancel"
                                     @confirm="handleWidgetEditModalConfirm"
        />
        <delete-modal :visible="widgetDeleteState.visibleModal"
                      :header-title="$t('DASHBOARDS.WIDGET.DELETE_TITLE')"
                      :contents="$t('DASHBOARDS.WIDGET.DELETE_CONTENTS')"
                      @update:visible="widgetDeleteState.visibleModal = $event"
                      @confirm="handleDeleteModalConfirm"
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
