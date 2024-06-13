<script lang="ts" setup>
import {
    computed, onBeforeMount, onUnmounted, reactive,
} from 'vue';

import {
    PDivider, PSelectButton, PButton,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import type {
    DashboardVariables as IDashboardVariables,
    DashboardOptions,
} from '@/schema/dashboard/_types/dashboard-type';

import WidgetFormOverlayStep2WidgetForm
    from '@/common/modules/widgets/_components/WidgetFormOverlayStep2WidgetForm.vue';
import { getWidgetComponent } from '@/common/modules/widgets/_helpers/widget-component-helper';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import { getWidgetDefaultWidth } from '@/common/modules/widgets/_helpers/widget-width-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';
import type { WidgetSize } from '@/common/modules/widgets/types/widget-display-type';

import DashboardToolsetDateDropdown from '@/services/dashboards/components/DashboardToolsetDateDropdown.vue';
import DashboardVariablesV2 from '@/services/dashboards/components/DashboardVariablesV2.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const widgetGenerateStore = useWidgetGenerateStore();
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
        if (state.widgetSize === 'full' || state.selectedWidgetSize === 'FULL') {
            return undefined;
        }
        return getWidgetDefaultWidth(state.widgetSize);
    }),
    //
    variablesSnapshot: {} as IDashboardVariables,
    dashboardOptionsSnapshot: {} as DashboardOptions,
});

/* Util */
const initSnapshot = () => {
    state.variablesSnapshot = cloneDeep(dashboardDetailState.variables);
    state.dashboardOptionsSnapshot = cloneDeep(dashboardDetailState.options);
};
const reset = () => {
    dashboardDetailStore.setVariables(state.variablesSnapshot);
    dashboardDetailStore.setOptions(state.dashboardOptionsSnapshot);
};

/* Event */
const handleChangeWidgetSize = (widgetSize: string) => {
    state.selectedWidgetSize = widgetSize;
};
const handleUpdateWidgetSize = (size: WidgetSize) => {
    widgetGenerateStore.setSize(size);
};

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
                <div class="widget-size-wrapper">
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
                 :class="{ 'full-size': state.selectedWidgetSize === 'FULL' }"
            >
                <component :is="getWidgetComponent(widgetGenerateState.selectedWidgetName)"
                           :widget-name="widgetGenerateState.selectedWidgetName"
                           :widget-id="widgetGenerateState.widgetId"
                           :data-table-id="widgetGenerateState.selectedDataTableId"
                           :size="state.widgetSize"
                           :width="state.widgetWidth"
                           :title="widgetGenerateState.title"
                           :description="widgetGenerateState.description"
                           :widget-options="widgetGenerateState.widgetValueMap"
                           mode="overlay"
                           @update-size="handleUpdateWidgetSize"
                />
                <p-button style-type="substitutive"
                          icon-left="ic_refresh"
                          class="update-preview-button"
                >
                    {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.UPDATE_PREVIEW') }}
                </p-button>
            </div>
        </div>
        <widget-form-overlay-step2-widget-form />
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
            }
        }
    }
}
</style>
