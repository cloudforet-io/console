<script lang="ts" setup>
import {
    computed, onBeforeMount, onUnmounted, reactive, ref, watch,
} from 'vue';

import { useMutation } from '@tanstack/vue-query';
import { cloneDeep, isEqual } from 'lodash';

import {
    PDivider, PSelectButton, PButton,
} from '@cloudforet/mirinae';

import type {
    DashboardOptions, DashboardVars,
} from '@/api-clients/dashboard/_types/dashboard-type';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFormOverlayStep2WidgetForm
    from '@/common/modules/widgets/_components/WidgetFormOverlayStep2WidgetForm.vue';
import { useWidgetFormQuery } from '@/common/modules/widgets/_composables/use-widget-form-query';
import { useWidgetOptionsComplexValidation } from '@/common/modules/widgets/_composables/use-widget-options-complex-validation';
import { WIDGET_WIDTH_RANGE_LIST } from '@/common/modules/widgets/_constants/widget-display-constant';
import { getWidgetComponent } from '@/common/modules/widgets/_helpers/widget-component-helper';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import { sanitizeWidgetOptions } from '@/common/modules/widgets/_helpers/widget-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import WidgetFieldValueManager from '@/common/modules/widgets/_widget-field-value-manager';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';
import type { WidgetType } from '@/common/modules/widgets/types/widget-model';

import DashboardToolsetDateDropdown from '@/services/dashboards/components/dashboard-detail/DashboardToolsetDateDropdown.vue';
import DashboardVariablesV2 from '@/services/dashboards/components/dashboard-detail/DashboardVariablesV2.vue';
import { useDashboardDetailQuery } from '@/services/dashboards/composables/use-dashboard-detail-query';
import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';
import {
    useAllReferenceTypeInfoStore,
} from '@/services/dashboards/stores/all-reference-type-info-store';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';



const overlayWidgetRef = ref<HTMLElement|null>(null);
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const dashboardDetailGetters = dashboardDetailStore.getters;
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;
const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();
const appContextStore = useAppContextStore();

const emit = defineEmits<{(event: 'watch-options-changed', value: boolean): void;}>();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});

/* Query */
const {
    dashboard,
    widgetList,
    keys,
    fetcher,
    queryClient,
} = useDashboardDetailQuery({
    dashboardId: computed(() => dashboardDetailState.dashboardId),
});
const {
    widget,
    dataTableList,
    keys: widgetKeys,
    fetcher: wigetFetcher,
    widgetLoading,
} = useWidgetFormQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});

let fieldManager: WidgetFieldValueManager;

const state = reactive({
    isPrivate: computed<boolean>(() => !!widgetGenerateState.widgetId?.startsWith('private')),
    selectedDataTable: computed<DataTableModel|undefined>(() => dataTableList.value.find((d) => d.data_table_id === widgetGenerateState.selectedDataTableId)),
    mounted: false,
    fieldManager: computed<WidgetFieldValueManager>(() => {
        if (!fieldManager) {
            fieldManager = new WidgetFieldValueManager(
                getWidgetConfig(widgetGenerateState.selectedWidgetName),
                state.selectedDataTable,
                cloneDeep(widget.value?.options) || {},
            );
        }
        return fieldManager;
    }),
    value: computed(() => state.fieldManager?.data?.granularity),
    widgetConfig: computed(() => getWidgetConfig(widgetGenerateState.selectedWidgetName)),
    selectedWidgetType: computed<WidgetType|undefined>(() => widget.value?.widget_type),
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
    widgetSizeOptions: [
        { label: i18n.t('COMMON.WIDGETS.FULL'), name: 'FULL' },
        { label: i18n.t('COMMON.WIDGETS.ACTUAL'), name: 'ACTUAL' },
    ],
    selectedWidgetSize: 'ACTUAL',
    widgetSize: computed(() => {
        if (widgetGenerateState.overlayType === 'EXPAND') return 'full';
        if (state.selectedWidgetSize === 'FULL') return 'full';
        return widget.value?.size;
    }),
    widgetWidth: computed(() => {
        if (state.widgetSize === 'full' || state.selectedWidgetSize === 'FULL' || widgetGenerateState.overlayType === 'EXPAND') {
            return undefined;
        }
        return WIDGET_WIDTH_RANGE_LIST[state.widgetSize]?.[0] || 0;
    }),
    isWidgetFieldChanged: computed<boolean>(() => {
        const _isOptionsChanged = !isEqual(cloneDeep(state.fieldManager.data), widget.value?.options);
        const _isTypeChanged = widgetGenerateState.selectedWidgetName !== widget.value?.widget_type;
        emit('watch-options-changed', _isOptionsChanged || _isTypeChanged);
        return _isOptionsChanged || _isTypeChanged;
    }),
    disableApplyButton: computed<boolean>(() => {
        if (!state.fieldManager?.validateAll()) return true;
        const _isWidgetInactive = widget.value?.state === 'INACTIVE';
        return (!_isWidgetInactive && !state.isWidgetFieldChanged) || widgetOptionsInvalid.value;
    }),
    //
    varsSnapshot: {} as DashboardVars,
    dashboardOptionsSnapshot: {} as DashboardOptions,
    isSharedDashboard: computed<boolean>(() => !!dashboard.value?.shared && !storeState.isAdminMode),
    isDashboardLayoutChanged: computed(() => {
        const _layouts = dashboard.value?.layouts || [];
        return !isEqual(_layouts?.[0]?.widgets, widgetList.value.map((w) => w.widget_id));
    }),
});

const {
    invalid: widgetOptionsInvalid,
    invalidText: widgetOptionsInvalidText,
} = useWidgetOptionsComplexValidation({
    optionValueMap: computed(() => widget.value?.options ?? {}),
    widgetConfig: computed(() => state.widgetConfig),
});

/* Api */
const { mutateAsync: updateWidgetMutate } = useMutation({
    mutationFn: wigetFetcher.updateWidgetFn,
    onSuccess: (data) => {
        const widgetQueryKey = state.isPrivate
            ? widgetKeys.privateWidgetQueryGetKey
            : widgetKeys.publicWidgetQueryGetKey;
        queryClient.setQueryData(widgetQueryKey.value, () => data);
    },
    onError: (e) => {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
    },
});
const updateWidget = async () => {
    if (!widgetGenerateState.widgetId) return;
    const _isCreating = widget.value?.state === 'CREATING';
    const sanitizedOptions = sanitizeWidgetOptions(state.fieldManager.data, widgetGenerateState.selectedWidgetName, state.selectedDataTable);
    const result = await updateWidgetMutate({
        widget_id: widgetGenerateState.widgetId,
        size: widgetGenerateState.size,
        widget_type: widgetGenerateState.selectedWidgetName,
        data_table_id: widgetGenerateState.selectedDataTableId,
        options: sanitizedOptions,
        state: 'ACTIVE',
    });
    if (result) {
        state.fieldManager.updateOriginData(cloneDeep(result.options));
    }

    if (_isCreating || state.isDashboardLayoutChanged) {
        const _layouts = cloneDeep(dashboard.value?.layouts || []);
        if (_layouts.length) {
            const _targetLayout = _layouts[0];
            if (_targetLayout.widgets) {
                const newLayoutWidgets = [..._targetLayout.widgets as string[], widgetGenerateState.widgetId];
                _targetLayout.widgets = sanitizeAndSortWidgets(newLayoutWidgets, widgetList.value.map((w) => w.widget_id));
            } else {
                _targetLayout.widgets = [widgetGenerateState.widgetId];
            }

            _layouts[0] = _targetLayout;
        } else {
            _layouts.push({
                widgets: [widgetGenerateState.widgetId],
            });
        }
        updateDashboard({
            dashboard_id: dashboardDetailState.dashboardId,
            layouts: _layouts,
        });
    }
};

const { mutate: updateDashboard } = useMutation(
    {
        mutationFn: fetcher.updateDashboardFn,
        onSuccess: (data) => {
            const dashboardQueryKey = state.isPrivate ? keys.privateDashboardGetQueryKey : keys.publicDashboardGetQueryKey;
            // queryClient.invalidateQueries({ queryKey: dashboardQueryKey.value });
            queryClient.setQueryData(dashboardQueryKey.value, () => data);
        },
    },
);

/* Util */
const sanitizeAndSortWidgets = (_layoutWidgets: string[] = [], _widgetList: string[] = []): string[] => {
    const uniqueWidgets = [...new Set(_layoutWidgets)];

    if (uniqueWidgets.length === _widgetList.length && uniqueWidgets.every((item) => _widgetList.includes(item))) {
        return [...uniqueWidgets];
    }

    const widgetsSet = new Set(uniqueWidgets);
    const widgetListSet = new Set(_widgetList);

    const missingInWidgets = [...widgetListSet].filter((item) => !widgetsSet.has(item));

    const sanitizedWidgets = uniqueWidgets.filter((item) => widgetListSet.has(item)).concat(missingInWidgets);

    const indexMap = new Map(_widgetList.map((item, index) => [item, index]));
    sanitizedWidgets.sort((a, b) => (indexMap.get(a) ?? Infinity) - (indexMap.get(b) ?? Infinity));


    return sanitizedWidgets;
};


const initSnapshot = () => {
    state.varsSnapshot = cloneDeep(dashboard.value?.vars || {});
    state.dashboardOptionsSnapshot = cloneDeep(dashboardDetailState.options);
};
const reset = () => {
    dashboardDetailStore.setVars(state.varsSnapshot);
    dashboardDetailStore.setOptions(state.dashboardOptionsSnapshot);
};
// const loadOverlayWidget = async () => {
//     await queryClient.invalidateQueries({
//         queryKey: [
//             ...(state.isPrivate ? widgetKeys.privateWidgetLoadQueryKey.value : widgetKeys.publicWidgetLoadQueryKey.value),
//             dashboardDetailState.dashboardId,
//             widgetGenerateState.widgetId,
//         ],
//     });
//     await queryClient.invalidateQueries({
//         queryKey: [
//             ...(state.isPrivate ? widgetKeys.privateWidgetLoadSumQueryKey.value : widgetKeys.publicWidgetLoadSumQueryKey.value),
//             dashboardDetailState.dashboardId,
//             widgetGenerateState.widgetId,
//         ],
//     });
// };

/* Event */
const handleChangeWidgetSize = (widgetSize: string) => {
    state.selectedWidgetSize = widgetSize;
};
const handleUpdateWidgetOptions = async () => {
    if (state.selectedWidgetType === widgetGenerateState.selectedWidgetName) {
        await updateWidget();
        // await loadOverlayWidget();
    } else {
        state.selectedWidgetType = widgetGenerateState.selectedWidgetName;
        await updateWidget();
        state.mounted = false;
    }
};
const handleMountWidgetComponent = () => {
    state.mounted = true;
};
const handleEditWidget = () => {
    widgetGenerateStore.setOverlayType('EDIT');
};

/* Watcher */
watch(() => widget.value?.size, (widgetSize) => {
    if (widgetSize === 'sm') {
        state.selectedWidgetSize = 'ACTUAL';
    } else {
        state.selectedWidgetSize = 'FULL';
    }
}, { immediate: true });
watch(() => state.mounted, async (mounted) => {
    if (mounted) {
        if (widget.value?.state === 'CREATING' || state.isDashboardLayoutChanged) {
            await updateWidget();
        }
        // await loadOverlayWidget();
        state.mounted = false;
    }
});

onBeforeMount(() => {
    initSnapshot();
});
onUnmounted(() => {
    reset();
});

</script>

<template>
    <div class="sidebar-contents"
         :class="{ 'expand': widgetGenerateState.overlayType === 'EXPAND' }"
    >
        <div class="left-part">
            <div class="dashboard-settings-wrapper">
                <div class="toolbox-wrapper">
                    <div class="left-wrapper">
                        <dashboard-toolset-date-dropdown widget-mode
                                                         :date-range="state.dashboardOptionsSnapshot.date_range"
                        />
                        <p-divider vertical
                                   class="divider"
                        />
                        <dashboard-variables-v2 disable-save-button
                                                widget-mode
                                                :is-project-dashboard="!!dashboard?.project_id"
                        />
                    </div>
                    <p-button v-if="!state.isSharedDashboard && !dashboard?.project_id && widgetGenerateState.overlayType === 'EXPAND'"
                              style-type="tertiary"
                              icon-left="ic_edit"
                              class="edit-button"
                              @click="handleEditWidget"
                    >
                        {{ $t('COMMON.WIDGETS.EDIT_WIDGET') }}
                    </p-button>
                </div>
                <div v-if="widgetGenerateState.overlayType !== 'EXPAND'"
                     class="widget-size-wrapper"
                >
                    <p-select-button v-for="widgetSize in state.widgetSizeOptions"
                                     :key="`widget-size-${widgetSize.name}`"
                                     :value="widgetSize.name"
                                     style-type="gray"
                                     :selected="state.selectedWidgetSize"
                                     @change="handleChangeWidgetSize"
                    >
                        {{ widgetSize.label }}
                    </p-select-button>
                </div>
            </div>
            <div v-if="!widgetLoading"
                 class="widget-wrapper"
                 :class="{ 'full-size': state.selectedWidgetSize === 'FULL' || widgetGenerateState.overlayType === 'EXPAND' }"
            >
                <component :is="getWidgetComponent(state.selectedWidgetType)"
                           :key="widgetGenerateState.selectedDataTableId"
                           ref="overlayWidgetRef"
                           :widget-name="widget?.widget_type"
                           :widget-id="widget?.widget_id"
                           :widget-state="widget?.state"
                           :data-table-id="widgetGenerateState.selectedDataTableId"
                           :size="state.widgetSize"
                           :width="state.widgetWidth"
                           :widget-options="widget?.options"
                           :data-tables="dataTableList"
                           :dashboard-options="dashboardDetailState.options"
                           :dashboard-vars="dashboardDetailGetters.refinedVars"
                           :dashboard-id="dashboardDetailState.dashboardId"
                           :all-reference-type-info="state.allReferenceTypeInfo"
                           disable-refresh-on-loading
                           mode="overlay"
                           @mounted="handleMountWidgetComponent"
                />
            </div>
        </div>
        <widget-form-overlay-step2-widget-form v-if="widgetGenerateState.overlayType !== 'EXPAND' && !!state.fieldManager && !widgetLoading"
                                               :widget-validation-invalid="widgetOptionsInvalid"
                                               :widget-validation-invalid-text="widgetOptionsInvalidText"
                                               :field-manager="state.fieldManager"
        />
        <portal to="apply-button">
            <p-button v-if="widgetGenerateState.overlayType !== 'EXPAND'"
                      style-type="substitutive"
                      icon-left="ic_refresh"
                      class="apply-button"
                      :disabled="state.disableApplyButton"
                      @click="handleUpdateWidgetOptions"
            >
                {{ $t('COMMON.WIDGETS.APPLY') }}
                <div v-if="state.isWidgetFieldChanged"
                     class="update-dot"
                />
            </p-button>
        </portal>
    </div>
</template>

<style lang="scss" scoped>
.sidebar-contents {
    width: 100%;
    display: flex;
    gap: 1rem;
    padding: 0 1.5rem 1rem 1.5rem;
    .left-part {
        @apply bg-gray-100 border border-gray-150 rounded-md;
        max-width: 75%;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        padding: 1rem;
        .dashboard-settings-wrapper {
            @apply flex items-center justify-between;
            width: 100%;
            padding-bottom: 1rem;
            .divider {
                height: 1rem;
            }
            .toolbox-wrapper {
                @apply flex items-center justify-between flex-1;
                .left-wrapper {
                    @apply flex items-center;
                    gap: 0.5rem;
                    .dashboard-variables-select-dropdown {
                        @apply relative flex items-center flex-wrap flex-1;
                        gap: 0.5rem;
                    }
                }
                .edit-button {
                    position: relative;
                    right: 4.5rem;
                }
            }
            .widget-size-wrapper {
                @apply flex justify-end items-center gap-2;
                min-width: 9rem;
                .divider {
                    height: 1.5rem;
                }
            }
        }
        .widget-wrapper {
            position: relative;
            display: flex;
            height: 100%;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            &.full-size {
                height: 100%;
                .widget-frame {
                    height: 100%;
                }
            }
        }
    }
    &.expand {
        .left-part {
            @apply border-none;
            max-width: 100%;
            padding: 1.5rem 0;
        }
    }
}
.apply-button {
    position: relative;
    .update-dot {
        @apply absolute bg-blue-500 rounded-full border-2 border-white;
        width: 0.75rem;
        height: 0.75rem;
        right: -0.375rem;
        top: -0.375rem;
    }
}
</style>
