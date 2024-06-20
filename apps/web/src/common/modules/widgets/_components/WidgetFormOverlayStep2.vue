<script lang="ts" setup>
import {
    computed, onBeforeMount, onUnmounted, reactive, ref, watch,
} from 'vue';

import {
    PDivider, PSelectButton, PButton,
} from '@spaceone/design-system';
import { cloneDeep, isEqual } from 'lodash';

import type {
    DashboardVariables as IDashboardVariables,
    DashboardOptions,
} from '@/schema/dashboard/_types/dashboard-type';

import WidgetFormOverlayStep2WidgetForm
    from '@/common/modules/widgets/_components/WidgetFormOverlayStep2WidgetForm.vue';
import { WIDGET_WIDTH_RANGE_LIST } from '@/common/modules/widgets/_constants/widget-display-constant';
import { getWidgetComponent } from '@/common/modules/widgets/_helpers/widget-component-helper';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';

import DashboardToolsetDateDropdown from '@/services/dashboards/components/DashboardToolsetDateDropdown.vue';
import DashboardVariablesV2 from '@/services/dashboards/components/DashboardVariablesV2.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


const overlayWidgetRef = ref<HTMLElement|null>(null);
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateGetters = widgetGenerateStore.getters;
const widgetGenerateState = widgetGenerateStore.state;
const state = reactive({
    widgetSizeOptions: [
        { label: 'Full', name: 'FULL' },
        { label: 'Actual', name: 'ACTUAL' },
    ],
    selectedWidgetSize: 'ACTUAL',
    widgetConfig: computed<WidgetConfig>(() => getWidgetConfig(widgetGenerateState.selectedWidgetName)),
    widgetSize: computed(() => {
        if (state.selectedWidgetSize === 'FULL') return 'full';
        return widgetGenerateState.size;
    }),
    widgetWidth: computed(() => {
        if (state.widgetSize === 'full' || state.selectedWidgetSize === 'FULL' || widgetGenerateState.overlayType === 'EXPAND') {
            return undefined;
        }
        return WIDGET_WIDTH_RANGE_LIST[state.widgetSize]?.[0] || 0;
    }),
    isWidgetOptionsChanged: computed<boolean>(() => !isEqual(widgetGenerateState.widgetValueMap, state.widgetValueMapSnapshot)),
    disableUpdatePreview: computed<boolean>(() => !state.isWidgetOptionsChanged || !widgetGenerateGetters.isAllWidgetFormValid),
    //
    widgetValueMapSnapshot: {} as Record<string, WidgetFieldValues>,
    variablesSnapshot: {} as IDashboardVariables,
    dashboardOptionsSnapshot: {} as DashboardOptions,
});

/* Util */
const initSnapshot = () => {
    state.variablesSnapshot = cloneDeep(dashboardDetailState.variables);
    state.dashboardOptionsSnapshot = cloneDeep(dashboardDetailState.options);
    state.widgetValueMapSnapshot = cloneDeep(widgetGenerateState.widgetValueMap);
};
const reset = () => {
    dashboardDetailStore.setVariables(state.variablesSnapshot);
    dashboardDetailStore.setOptions(state.dashboardOptionsSnapshot);
};

/* Event */
const handleChangeWidgetSize = (widgetSize: string) => {
    state.selectedWidgetSize = widgetSize;
};
const handleUpdatePreview = async () => {
    state.widgetValueMapSnapshot = cloneDeep(widgetGenerateState.widgetValueMap);
    const res = await overlayWidgetRef.value?.loadWidget();
    if (typeof res === 'function') {
        res('Please check the widget options.');
    }
};

/* Watcher */
watch(() => widgetGenerateState.selectedWidgetName, () => {
    if (widgetGenerateState.size === 'sm') {
        state.selectedWidgetSize = 'ACTUAL';
    } else {
        state.selectedWidgetSize = 'FULL';
    }
}, { immediate: true });

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
                </div>
            </div>
            <div class="widget-wrapper"
                 :class="{ 'full-size': state.selectedWidgetSize === 'FULL' || widgetGenerateState.overlayType === 'EXPAND' }"
            >
                <component :is="getWidgetComponent(widgetGenerateState.selectedWidgetName)"
                           ref="overlayWidgetRef"
                           :widget-name="widgetGenerateState.selectedWidgetName"
                           :widget-id="widgetGenerateState.widgetId"
                           :data-table-id="widgetGenerateState.selectedDataTableId"
                           :size="state.widgetSize"
                           :width="state.widgetWidth"
                           :title="widgetGenerateState.title"
                           :description="widgetGenerateState.description"
                           :widget-options="widgetGenerateState.widgetValueMap"
                           :dashboard-options="dashboardDetailState.options"
                           :dashboard-variables="dashboardDetailState.variables"
                           mode="overlay"
                />
                <p-button v-if="widgetGenerateState.overlayType !== 'EXPAND'"
                          style-type="substitutive"
                          icon-left="ic_refresh"
                          class="update-preview-button"
                          :disabled="state.disableUpdatePreview"
                          @click="handleUpdatePreview"
                >
                    <span>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.UPDATE_PREVIEW') }}</span>
                    <div v-if="state.isWidgetOptionsChanged"
                         class="update-dot"
                    />
                </p-button>
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
        @apply bg-gray-150 rounded-md;
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
            }
        }
        .widget-wrapper {
            position: relative;
            display: flex;
            height: 100%;
            justify-content: center;
            align-items: center;
            &.full-size {
                height: 100%;
                .widget-frame {
                    height: 100%;
                }
            }
            .update-preview-button {
                position: absolute;
                top: 1rem;
                right: 1rem;
                z-index: 100;
                .update-dot {
                    @apply absolute bg-blue-500 rounded-full border-2 border-white;
                    width: 0.5rem;
                    height: 0.5rem;
                    right: -0.25rem;
                    top: -5px;
                }
            }
        }
    }
}
</style>
