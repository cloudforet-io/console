<script lang="ts" setup>
import {
    computed, nextTick, onBeforeMount, onMounted, onUnmounted, reactive, ref, watch,
} from 'vue';

import {
    PDivider, PSelectButton, PButton,
} from '@spaceone/design-system';
import { cloneDeep, isEqual } from 'lodash';

import type {
    DashboardOptions, DashboardVars,
} from '@/schema/dashboard/_types/dashboard-type';

import WidgetFormOverlayStep2WidgetForm
    from '@/common/modules/widgets/_components/WidgetFormOverlayStep2WidgetForm.vue';
import { WIDGET_WIDTH_RANGE_LIST } from '@/common/modules/widgets/_constants/widget-display-constant';
import { getWidgetComponent } from '@/common/modules/widgets/_helpers/widget-component-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';

import DashboardToolsetDateDropdown from '@/services/dashboards/components/DashboardToolsetDateDropdown.vue';
import DashboardVariablesV2 from '@/services/dashboards/components/DashboardVariablesV2.vue';
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
const widgetGenerateGetters = widgetGenerateStore.getters;
const widgetGenerateState = widgetGenerateStore.state;
const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();
const state = reactive({
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
    widgetSizeOptions: [
        { label: 'Full', name: 'FULL' },
        { label: 'Actual', name: 'ACTUAL' },
    ],
    selectedWidgetSize: 'ACTUAL',
    widgetSize: computed(() => {
        if (widgetGenerateState.overlayType === 'EXPAND') return 'full';
        if (state.selectedWidgetSize === 'FULL') return 'full';
        return widgetGenerateState.widget?.size;
    }),
    widgetWidth: computed(() => {
        if (state.widgetSize === 'full' || state.selectedWidgetSize === 'FULL' || widgetGenerateState.overlayType === 'EXPAND') {
            return undefined;
        }
        return WIDGET_WIDTH_RANGE_LIST[state.widgetSize]?.[0] || 0;
    }),
    isWidgetFieldChanged: computed<boolean>(() => {
        const _isOptionsChanged = Object.entries(widgetGenerateState.widgetFormValueMap).some(([k, v]) => {
            if (v !== undefined) {
                return !isEqual(v, widgetGenerateState.widget?.options?.[k]);
            }
            return false;
        });
        // const _isWidgetInactive = widgetGenerateState.widget?.state === 'INACTIVE'; // TODO: after api is ready
        const _isTypeChanged = widgetGenerateState.selectedWidgetName !== widgetGenerateState.widget?.widget_type;
        const _isNameChanged = widgetGenerateState.title !== widgetGenerateState.widget?.name;
        const _isDescriptionChanged = widgetGenerateState.description !== widgetGenerateState.widget?.description;
        return _isOptionsChanged || _isTypeChanged || _isNameChanged || _isDescriptionChanged;
    }),
    disableApplyButton: computed<boolean>(() => !state.isWidgetFieldChanged || !widgetGenerateGetters.isAllWidgetFormValid),
    //
    varsSnapshot: {} as DashboardVars,
    dashboardOptionsSnapshot: {} as DashboardOptions,
});

/* Util */
const initSnapshot = () => {
    state.varsSnapshot = cloneDeep(dashboardDetailState.vars);
    state.dashboardOptionsSnapshot = cloneDeep(dashboardDetailState.options);
};
const reset = () => {
    dashboardDetailStore.setVars(state.varsSnapshot);
    dashboardDetailStore.setOptions(state.dashboardOptionsSnapshot);
};
const loadOverlayWidget = async () => {
    const res = await overlayWidgetRef.value?.loadWidget();
    if (typeof res === 'function') {
        res('Please check the widget options.');
    }
};

/* Event */
const handleChangeWidgetSize = (widgetSize: string) => {
    state.selectedWidgetSize = widgetSize;
};
const handleUpdateWidgetOptions = async () => {
    await widgetGenerateStore.updateWidget({
        widget_id: widgetGenerateState.widgetId,
        name: widgetGenerateState.title,
        description: widgetGenerateState.description,
        size: widgetGenerateState.size,
        widget_type: widgetGenerateState.selectedWidgetName,
        data_table_id: widgetGenerateState.selectedDataTableId,
        options: widgetGenerateState.widgetFormValueMap,
        // state: 'ACTIVE' // TODO: update after api is ready
    });
    await nextTick();
    await loadOverlayWidget();
};

/* Watcher */
watch(() => widgetGenerateState.widget?.size, (widgetSize) => {
    if (widgetSize === 'sm') {
        state.selectedWidgetSize = 'ACTUAL';
    } else {
        state.selectedWidgetSize = 'FULL';
    }
}, { immediate: true });

onMounted(async () => {
    await loadOverlayWidget();
});
onBeforeMount(() => {
    initSnapshot();
});
onUnmounted(() => {
    reset();
});
</script>

<template>
    <div class="sidebar-contents">
        <div class="left-part">
            <div class="dashboard-settings-wrapper">
                <div class="toolbox-wrapper">
                    <dashboard-toolset-date-dropdown :date-range="state.dashboardOptionsSnapshot.date_range" />
                    <p-divider vertical
                               class="divider"
                    />
                    <dashboard-variables-v2 disable-save-button />
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
                    <p-divider vertical
                               class="divider"
                    />
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
                </div>
            </div>
            <div class="widget-wrapper"
                 :class="{ 'full-size': state.selectedWidgetSize === 'FULL' || widgetGenerateState.overlayType === 'EXPAND' }"
            >
                <component :is="getWidgetComponent(widgetGenerateState.widget.widget_type)"
                           ref="overlayWidgetRef"
                           :widget-name="widgetGenerateState.widget.widget_type"
                           :widget-id="widgetGenerateState.widget.widget_id"
                           :data-table-id="widgetGenerateState.selectedDataTableId"
                           :size="state.widgetSize"
                           :width="state.widgetWidth"
                           :title="widgetGenerateState.widget.name"
                           :description="widgetGenerateState.widget.description"
                           :widget-options="widgetGenerateState.widget.options"
                           :dashboard-options="dashboardDetailState.options"
                           :dashboard-vars="dashboardDetailGetters.refinedVars"
                           :all-reference-type-info="state.allReferenceTypeInfo"
                           disable-refresh-on-loading
                           mode="overlay"
                />
            </div>
        </div>
        <widget-form-overlay-step2-widget-form v-if="widgetGenerateState.overlayType !== 'EXPAND'" />
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
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        padding: 1rem;
        .dashboard-settings-wrapper {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            padding-bottom: 1rem;
            .divider {
                height: 1rem;
            }
            .toolbox-wrapper {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                .dashboard-variables-select-dropdown {
                    @apply relative flex items-center flex-wrap;
                    gap: 0.5rem;
                }
            }
            .widget-size-wrapper {
                display: flex;
                gap: 0.5rem;
                align-items: center;
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
    }
}
</style>
