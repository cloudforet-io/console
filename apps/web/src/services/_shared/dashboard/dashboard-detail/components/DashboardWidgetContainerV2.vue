<script setup lang="ts">
import type { ComponentPublicInstance, AsyncComponent } from 'vue';
import {
    reactive, ref, watch, computed, onBeforeUnmount,
} from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { cloneDeep, debounce, flattenDeep } from 'lodash';

import {
    PDataLoader, PEmpty, PButton,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import {
    usePrivateDataTableApi,
} from '@/api-clients/dashboard/private-data-table/composables/use-private-data-table-api';
import type { PrivateDataTableModel } from '@/api-clients/dashboard/private-data-table/schema/model';
import type { PrivateWidgetDeleteParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/delete';
import type { PrivateWidgetModel } from '@/api-clients/dashboard/private-widget/schema/model';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { usePublicDataTableApi } from '@/api-clients/dashboard/public-data-table/composables/use-public-data-table-api';
import type { PublicDataTableModel } from '@/api-clients/dashboard/public-data-table/schema/model';
import type { PublicWidgetDeleteParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/delete';
import type { PublicWidgetModel } from '@/api-clients/dashboard/public-widget/schema/model';
import { i18n } from '@/translations';

import { useDisplayStore } from '@/store/display/display-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import { getWidgetComponent } from '@/common/modules/widgets/_helpers/widget-component-helper';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import { widgetWidthAssigner } from '@/common/modules/widgets/_helpers/widget-width-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { WidgetHeaderValue } from '@/common/modules/widgets/_widget-fields/header/type';
import type {
    WidgetExpose, WidgetProps, WidgetSize, WidgetOverlayType,
} from '@/common/modules/widgets/types/widget-display-type';
import WidgetFormOverlayLayout from '@/common/modules/widgets/WidgetFormOverlayLayout.vue';

import { useDashboardManageable } from '@/services/_shared/dashboard/core/composables/_internal/use-dashboard-manageable';
import DashboardReorderSidebar
    from '@/services/_shared/dashboard/dashboard-detail/components/DashboardReorderSidebar.vue';
import {
    useDashboardContainerWidth,
} from '@/services/_shared/dashboard/dashboard-detail/composables/use-dashboard-container-width';
import { useDashboardGetQuery } from '@/services/_shared/dashboard/dashboard-detail/composables/use-dashboard-get-query';
import { useDashboardWidgetListQuery } from '@/services/_shared/dashboard/dashboard-detail/composables/use-dashboard-widget-list-query';
import { useDashboardRefinedVars } from '@/services/_shared/dashboard/dashboard-detail/contextual-composables/use-dashboard-refined-vars';
import { useDashboardDetailInfoStore } from '@/services/_shared/dashboard/dashboard-detail/stores/dashboard-detail-info-store';
import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';
import {
    useAllReferenceTypeInfoStore,
} from '@/services/dashboards/stores/all-reference-type-info-store';
import type { SharedDataTableInfo } from '@/services/dashboards/types/shared-dashboard-type';


type DataTableModel = PublicDataTableModel|PrivateDataTableModel;
type WidgetComponent = ComponentPublicInstance<WidgetProps, WidgetExpose>;
type WidgetModel = PublicWidgetModel|PrivateWidgetModel;
type RefinedWidgetInfo = WidgetModel & {
    size: WidgetSize;
    width?: number;
    component: AsyncComponent|null;
};

const props = defineProps<{
    dashboardId: string;
}>();


const dashboardId = computed(() => props.dashboardId);

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;
const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();
const allReferenceStore = useAllReferenceStore();
const displayStore = useDisplayStore();
const { publicDataTableAPI } = usePublicDataTableApi();
const { privateDataTableAPI } = usePrivateDataTableApi();
const { refinedVars } = useDashboardRefinedVars(dashboardId);

/* Query */
const {
    dashboard,
    keys: dashboardKeys,
    isLoading: dashboardLoading,
    fetcher,
} = useDashboardGetQuery({
    dashboardId,
});
const {
    keys: widgetListKeys,
    api: widgetApi,
    fetcher: widgetFetcher,
    isLoading: widgetLoading,
    widgetList,
} = useDashboardWidgetListQuery({
    dashboardId,
});
const queryClient = useQueryClient();
const { getDashboardManageable } = useDashboardManageable();
const dashboardManageable = computed(() => getDashboardManageable(dashboard.value));

/* State */
const containerRef = ref<HTMLElement|null>(null);
const widgetRef = ref<Array<WidgetComponent|null>>([]);
const storeState = reactive({
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
});
const state = reactive({
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
    mountedWidgetMap: {} as Record<string, boolean>,
    intersectedWidgetMap: {} as Record<string, boolean>,
    isAllWidgetsMounted: computed<boolean>(() => Object.values(state.mountedWidgetMap).every((d) => d)),
    refinedWidgetInfoList: computed<RefinedWidgetInfo[]>(() => getRefinedWidgetInfoList(widgetList.value, containerWidth.value)),
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
const getRefinedWidgetInfoList = (dashboardWidgets: Array<PublicWidgetModel|PrivateWidgetModel>): RefinedWidgetInfo[] => {
    if (!dashboardWidgets.length) {
        return [];
    }
    let _refinedWidgets: RefinedWidgetInfo[] = [];
    dashboard.value?.layouts?.forEach((d) => {
        const _widgetIdList = d.widgets;
        _widgetIdList?.forEach((widgetId) => {
            const _widget = dashboardWidgets.find((w) => w.widget_id === widgetId);
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
        });
    });

    // width
    _refinedWidgets = getResizedWidgetInfoList(_refinedWidgets, containerWidth.value);

    return _refinedWidgets;
};
const getWidgetLoading = (widgetId: string) => {
    if (!state.isAllWidgetsMounted) return true;
    if (!state.intersectedWidgetMap[widgetId]) return true;
    return false;
};
const refreshAllWidget = debounce(async () => {
    dashboardDetailStore.setLoadingWidgets(true);

    widgetRef.value.forEach((comp) => {
        if (!comp) return false;
        comp.loadWidget();
        return true;
    });

    dashboardDetailStore.setLoadingWidgets(false);
}, 150);
const loadAWidget = async (widgetId: string) => {
    if (!widgetId) return;
    widgetRef.value.forEach((comp) => {
        if (!comp || comp.$el.id !== widgetId) return;
        comp.loadWidget();
    });
};
const getResizedWidgetInfoList = (widgetInfoList: RefinedWidgetInfo[], _containerWidth: number): RefinedWidgetInfo[] => {
    const _refinedWidgetInfoList = cloneDeep(widgetInfoList);
    const _widgetSizeList: WidgetSize[] = widgetInfoList.map((widget) => widget.size);
    const _widths: number[] = flattenDeep(widgetWidthAssigner(_widgetSizeList, _containerWidth));
    _refinedWidgetInfoList.forEach((widget, idx) => {
        widget.width = _widths[idx];
    });
    return _refinedWidgetInfoList;
};


/* Api */
const { mutateAsync: updateDashboard } = useMutation(
    {
        mutationFn: fetcher.updateDashboardFn,
        onSuccess: async (_dashboard: PublicDashboardModel|PrivateDashboardModel) => {
            const isPrivate = _dashboard.dashboard_id.startsWith('private');
            const dashboardQueryKey = isPrivate ? dashboardKeys.privateDashboardGetQueryKey : dashboardKeys.publicDashboardGetQueryKey;
            await queryClient.invalidateQueries({ queryKey: dashboardQueryKey.value });
        },
    },
);
const deleteWidgetFn = (params: PrivateWidgetDeleteParameters|PublicWidgetDeleteParameters) => {
    const isPrivate = dashboardId.value?.startsWith('private');
    const _fetcher = isPrivate
        ? widgetApi.privateWidgetAPI.delete
        : widgetApi.publicWidgetAPI.delete;
    return _fetcher(params);
};
const { mutateAsync: deleteWidget } = useMutation(
    {
        mutationFn: deleteWidgetFn,
        onSuccess: (_, variables) => {
            // delete wisdget from mounted map
            delete state.mountedWidgetMap[variables.widget_id];
            state.mountedWidgetMap = { ...state.mountedWidgetMap };

            const isPrivate = variables.widget_id?.startsWith('private');
            const widgetListQueryKey = isPrivate ? widgetListKeys.privateWidgetListQueryKey : widgetListKeys.publicWidgetListQueryKey;
            queryClient.invalidateQueries({ queryKey: widgetListQueryKey.value });
        },
        onError: (e) => {
            ErrorHandler.handleError(e);
        },
        onSettled: () => {
            // close modal
            widgetDeleteState.visibleModal = false;
            widgetDeleteState.targetWidget = null;
        },
    },
);

const { mutate: updateWidgetSize } = useMutation({
    mutationFn: widgetFetcher.updateWidgetFn,
    onSuccess: (_, variables) => {
        const isPrivate = dashboardId.value?.startsWith('private');
        const widgetListQueryKey = isPrivate ? widgetListKeys.privateWidgetListQueryKey : widgetListKeys.publicWidgetListQueryKey;
        queryClient.setQueryData(widgetListQueryKey.value, (oldData: ListResponse<WidgetModel>) => {
            const _updatedWidgetList = (oldData.results ?? []).map((widget) => {
                if (widget.widget_id === variables.widget_id) {
                    return { ...widget, size: variables.size };
                }
                return widget;
            });
            return {
                ...oldData,
                results: _updatedWidgetList,
            };
        });
    },
    onError: (error) => {
        ErrorHandler.handleError(error);
    },
});

const listWidgetDataTables = async (widgetId: string) => {
    const isPrivate = widgetId.startsWith('private');
    const _fetcher = isPrivate
        ? privateDataTableAPI.list
        : publicDataTableAPI.list;
    try {
        const { results } = await _fetcher({ widget_id: widgetId });
        if (!results) return [];
        const _refinedResults = cloneDeep(results);
        results.forEach((r, idx) => {
            if (r.data_type === DATA_TABLE_TYPE.ADDED && r.source_type === 'COST') {
                const _dataSourceId = r.options.COST?.data_source_id;
                _refinedResults[idx].options.COST.plugin_id = storeState.costDataSource[_dataSourceId]?.data?.plugin_info?.plugin_id;
                _refinedResults[idx].options.COST.data_source_id = undefined;
            }
        });
        return _refinedResults ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};
const getRefinedDataTables = (dataTableList: DataTableModel[]) => {
    const results: SharedDataTableInfo[] = [];

    dataTableList.forEach((dt) => {
        const _sharedDataTable = {
            name: dt.name,
            data_type: dt.data_type,
            source_type: dt.source_type,
            operator: dt.operator,
            options: dt.options,
        };
        if (dt.data_type === DATA_TABLE_TYPE.TRANSFORMED) {
            if (dt.operator === 'JOIN' || dt.operator === 'CONCAT') {
                const _dataTableIds = dt.options[dt.operator]?.data_tables;
                const _dataTableIndices = _dataTableIds?.map((dtId) => dataTableList.findIndex((d) => d.data_table_id === dtId));
                _sharedDataTable.options = {
                    [dt.operator]: {
                        ...dt.options[dt.operator],
                        data_tables: _dataTableIndices,
                    },
                };
            } else {
                const _dataTableId = dt.options[dt.operator]?.data_table_id;
                const _dataTableIdx = dataTableList.findIndex((d) => d.data_table_id === _dataTableId);
                _sharedDataTable.options = {
                    [dt.operator]: {
                        ...dt.options[dt.operator],
                        data_table_id: _dataTableIdx,
                    },
                };
            }
        }
        results.push(_sharedDataTable);
    });

    return results;
};


/* Event */
const handleClickDeleteWidget = (widget: RefinedWidgetInfo) => {
    widgetDeleteState.targetWidget = widget;
    widgetDeleteState.visibleModal = true;
};
const handleOpenWidgetOverlay = (widget: RefinedWidgetInfo, overlayType: WidgetOverlayType) => {
    widgetGenerateStore.setOverlayType(overlayType);
    widgetGenerateStore.setWidgetFormInfo(widget);
    widgetGenerateStore.setOverlayStep(2);
    widgetGenerateStore.setShowOverlay(true);
};
const handleCloneWidget = async (widget: RefinedWidgetInfo) => {
    if (!dashboardId.value) return;
    const isPrivate = widget.widget_id.startsWith('private');
    const widgetCreateFetcher = isPrivate
        ? widgetApi.privateWidgetAPI.create
        : widgetApi.publicWidgetAPI.create;
    const widgetUpdateFetcher = isPrivate
        ? widgetApi.privateWidgetAPI.update
        : widgetApi.publicWidgetAPI.update;

    const dataTableList = await listWidgetDataTables(widget.widget_id);
    const dataTableIndex = dataTableList.findIndex((d) => d.data_table_id === widget.data_table_id);
    const refinedDataTables = getRefinedDataTables(dataTableList);
    try {
        const createdWidget = await widgetCreateFetcher({
            dashboard_id: dashboardId.value,
            widget_type: widget.widget_type,
            size: widget.size,
            options: {
                ...widget.options,
                widgetHeader: {
                    ...(widget.options?.widgetHeader as WidgetHeaderValue ?? {}),
                    title: widget.options?.widgetHeader?.title ? `Clone - ${widget.options.widgetHeader.title}` : undefined,
                },
            },
            data_tables: refinedDataTables,
            data_table_id: dataTableIndex,
        });
        const completedWidget = await widgetUpdateFetcher({
            widget_id: createdWidget.widget_id,
            state: 'ACTIVE',
        });
        const widgetListQueryKey = isPrivate ? widgetListKeys.privateWidgetListQueryKey : widgetListKeys.publicWidgetListQueryKey;
        await queryClient.setQueryData(widgetListQueryKey.value, (oldData: ListResponse<WidgetModel>) => ({
            ...oldData,
            results: [...(oldData.results || []), completedWidget],
        }));

        const _layouts = cloneDeep(dashboard.value?.layouts || []);
        if (_layouts.length) {
            const _targetLayout = _layouts[0];
            if (_targetLayout.widgets) {
                _targetLayout.widgets.push(createdWidget.widget_id);
            } else {
                _targetLayout.widgets = [createdWidget.widget_id];
            }
            _layouts[0] = _targetLayout;
        } else {
            _layouts.push({
                widgets: [createdWidget.widget_id],
            });
        }
        await updateDashboard({
            dashboard_id: dashboardId.value || '',
            layouts: _layouts,
        });

        dashboardDetailStore.setDashboardWidgets([...widgetList.value, completedWidget]);
        showSuccessMessage(i18n.t('COMMON.WIDGETS.CLONE_SUCCESS_MSG'), '');
    } catch (e: any) {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
    }
};
const handleToggleWidgetSize = async (widget: RefinedWidgetInfo, size: WidgetSize) => {
    const _widget = widgetList.value.find((w) => w.widget_id === widget.widget_id);
    if (!_widget) return;
    await updateWidgetSize({
        widget_id: widget.widget_id,
        size,
    });
};
const handleWidgetMounted = (widgetId: string) => {
    state.mountedWidgetMap = {
        ...state.mountedWidgetMap,
        [widgetId]: true,
    };
};
const handleDeleteModalConfirm = async () => {
    const _targetWidgetId = widgetDeleteState.targetWidget?.widget_id as string;
    // 1. remove from dashboard layouts
    const _dashboardLayouts = cloneDeep(dashboard.value?.layouts ?? []);
    const firstLayout = _dashboardLayouts[0];
    const deletedWidgetIndex = firstLayout?.widgets?.indexOf(_targetWidgetId) ?? -1;
    const changedLayouts = deletedWidgetIndex !== -1
        ? (_dashboardLayouts[0]?.widgets?.splice(deletedWidgetIndex, 1), _dashboardLayouts)
        : undefined;

    await updateDashboard({
        dashboard_id: dashboardId.value || '',
        layouts: changedLayouts,
    });
    // 2. delete widget
    await deleteWidget({ widget_id: _targetWidgetId });
};
const handleClickAddWidget = () => {
    widgetGenerateStore.setOverlayType('ADD');
    widgetGenerateStore.setShowOverlay(true);
};

/* Watcher */
// watch([widgetList, () => dashboard.value?.layouts], ([widgets]) => {
//     state.refinedWidgetInfoList = getRefinedWidgetInfoList(widgets);
// });
watch(() => widgetGenerateState.showOverlay, async (showOverlay) => {
    if (!showOverlay && widgetGenerateState.overlayType !== 'EXPAND') {
        state.remountWidgetId = widgetGenerateState.latestWidgetId;

        // fetch widget list
        const isPrivate = dashboard.value?.dashboard_id?.startsWith('private');
        const widgetListQueryKey = isPrivate ? widgetListKeys.privateWidgetListQueryKey : widgetListKeys.publicWidgetListQueryKey;
        await queryClient.invalidateQueries({ queryKey: widgetListQueryKey.value });

        state.remountWidgetId = undefined;
        await loadAWidget(widgetGenerateState.latestWidgetId);
    }
});
watch(widgetList, (dashboardWidgets) => {
    // delete creating widgets
    if (!widgetGenerateState.showOverlay) {
        dashboardWidgets.forEach((widget) => {
            if (widget.state === 'CREATING') {
                deleteWidget({ widget_id: widget.widget_id });
            }
        });
    }
}, { immediate: true });
// watch(() => containerWidth.value, (_containerWidth) => {
//     if (!state.refinedWidgetInfoList?.length) return;
//     state.refinedWidgetInfoList = getResizedWidgetInfoList(state.refinedWidgetInfoList, _containerWidth);
// });
defineExpose({
    refreshAllWidget,
});


/* Widget Intersection Observer */
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
const stopWidgetInfoWatch = watch(() => state.refinedWidgetInfoList, (widgetInfoList) => {
    if (!widgetInfoList || !Array.isArray(widgetInfoList)) return;

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
</script>

<template>
    <div ref="containerRef"
         class="dashboard-widget-container"
    >
        <p-data-loader :loading="dashboardLoading || widgetLoading"
                       :data="state.refinedWidgetInfoList"
                       loader-backdrop-color="gray.100"
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
                               :widget-state="widget.state"
                               :data-table-id="widget.data_table_id"
                               :size="widget.size"
                               :width="widget.width"
                               :widget-options="widget.options"
                               :mode="displayStore.state.visibleSidebar ? 'edit-layout' : 'view'"
                               :loading="getWidgetLoading(widget.widget_id)"
                               :dashboard-options="dashboardDetailState.options"
                               :dashboard-vars="refinedVars"
                               :dashboard-id="dashboardId"
                               :disable-refresh-on-variable-change="widgetGenerateState.showOverlay || dashboardDetailState.loadingDashboard"
                               :disable-manage-buttons="!dashboardManageable"
                               :all-reference-type-info="state.allReferenceTypeInfo"
                               :load-disabled="widgetGenerateState.showOverlay || getWidgetLoading(widget.widget_id)"
                               @mounted="handleWidgetMounted(widget.widget_id)"
                               @click-edit="handleOpenWidgetOverlay(widget, 'EDIT')"
                               @click-clone="handleCloneWidget(widget)"
                               @click-delete="handleClickDeleteWidget(widget)"
                               @click-expand="handleOpenWidgetOverlay(widget, 'EXPAND')"
                               @toggle-size="handleToggleWidgetSize(widget, $event)"
                    />
                </template>
            </div>
        </p-data-loader>
        <div v-if="!(dashboardLoading || widgetLoading) && !state.refinedWidgetInfoList?.length"
             class="no-data-wrapper"
        >
            <p-empty show-image
                     image-size="sm"
                     class="empty-wrapper"
                     :show-button="dashboardManageable"
            >
                {{ $t('DASHBOARDS.DETAIL.NO_WIDGET_TEXT') }}
                <template #button>
                    <p-button style-type="substitutive"
                              icon-left="ic_plus_bold"
                              class="add-widget-button"
                              @click="handleClickAddWidget"
                    >
                        {{ $t('DASHBOARDS.DETAIL.ADD_WIDGET') }}
                    </p-button>
                </template>
            </p-empty>
        </div>
        <delete-modal :visible="widgetDeleteState.visibleModal"
                      :header-title="$t('DASHBOARDS.WIDGET.DELETE_TITLE')"
                      :contents="$t('DASHBOARDS.WIDGET.DELETE_CONTENTS')"
                      @update:visible="widgetDeleteState.visibleModal = $event"
                      @confirm="handleDeleteModalConfirm"
        />
        <widget-form-overlay-layout :dashboard="dashboard" />
        <dashboard-reorder-sidebar :dashboard-id="dashboardId"
                                   :widget-info-list="state.refinedWidgetInfoList ?? []"
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
        width: 100%;
        padding: 3.5rem 0;
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
