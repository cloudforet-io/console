<script setup lang="ts">
import { vIntersectionObserver } from '@vueuse/components';
import type { ComponentPublicInstance } from 'vue';
import {
    reactive, ref, watch, computed, toRef,
} from 'vue';

import {
    debounce, isEmpty, isEqual,
} from 'lodash';

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

const allReferenceStore = useAllReferenceStore();

const widgetRef = ref<Array<WidgetComponent|null>>([]);
const state = reactive({
    initiatedWidgetMap: {} as Record<string, any>,
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
const handleUpdateWidgetInfo = (widgetKey: string, widgetInfo: Partial<DashboardLayoutWidgetInfo>) => {
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
    targetWidget: null as ReformedWidgetInfo|null,
});
const handleConfirmWidgetEditModal = () => {
    const target = widgetEditState.targetWidget;
    if (!target) return;
    const targetWidgetRef = widgetRef.value.find((d) => d?.$el?.id === target.widget_key);
    targetWidgetRef?.refreshWidget();
    widgetEditState.targetWidget = null;
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

    const target = widgetViewState.targetWidget;
    if (!target) return;
    const targetWidgetRef = widgetRef.value.find((d) => d?.$el?.id === target.widget_key);
    targetWidgetRef?.refreshWidget();
    widgetViewState.targetWidget = null;
};
</script>

<template>
    <div ref="containerRef"
         class="dashboard-widget-container"
    >
        <template v-if="!dashboardDetailState.loadingDashboard && dashboardDetailStore.isAllVariablesInitialized">
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
                           :edit-mode="props.editMode"
                           :error-mode="props.editMode && dashboardDetailState.widgetValidMap[widget.widget_key] === false"
                           :all-reference-type-info="state.allReferenceTypeInfo"
                           :disable-refresh-on-variable-change="widgetViewState.visibleModal || !state.initiatedWidgetMap[widget.widget_key]"
                           :dashboard-settings="dashboardDetailState.settings"
                           :dashboard-variables-schema="dashboardDetailState.variablesSchema"
                           :dashboard-variables="dashboardDetailState.variables"
                           @refreshed="handleWidgetRefreshed(widget.widget_key, $event)"
                           @update-widget-info="handleUpdateWidgetInfo(widget.widget_key, $event)"
                           @update-widget-validation="handleUpdateValidation(widget.widget_key, $event)"
                           @click-edit="handleClickWidgetEdit(widget)"
                           @click-delete="handleClickDeleteWidget(widget)"
                           @click-expand="handleClickWidgetExpand(widget)"
                />
            </template>
        </template>
        <widget-view-mode-modal :visible="widgetViewState.visibleModal"
                                :widget-info="widgetViewState.targetWidget"
                                @update:visible="handleUpdateViewModalVisible"
        />
        <dashboard-widget-edit-modal v-if="widgetEditState.targetWidget"
                                     :widget-config-id="widgetEditState.targetWidget.widget_name"
                                     :visible="widgetEditState.visibleModal"
                                     :widget-key="widgetEditState.targetWidget.widget_key"
                                     @update:visible="widgetEditState.visibleModal = $event"
                                     @confirm="handleConfirmWidgetEditModal"
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
}
</style>
