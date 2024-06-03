<script lang="ts" setup>
import { onBeforeMount, reactive } from 'vue';

import {
    PDivider, PSelectButton,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import type {
    DashboardVariables as IDashboardVariables,
    DashboardVariablesSchema, DateRange,
} from '@/schema/dashboard/_types/dashboard-type';

import WidgetFormOverlayStep2WidgetForm
    from '@/common/modules/widgets/_components/WidgetFormOverlayStep2WidgetForm.vue';
import { getWidgetComponent } from '@/common/modules/widgets/_helpers/widget-component-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';

import DashboardToolsetDateDropdown from '@/services/dashboards/components/DashboardToolsetDateDropdown.vue';
import DashboardVariables from '@/services/dashboards/components/DashboardVariables.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailGetters = dashboardDetailStore.getters;
const dashboardDetailState = dashboardDetailStore.state;
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;
const state = reactive({
    widgetSizeOptions: [
        { label: 'Full', name: 'FULL' },
        { label: 'Actual', name: 'ACTUAL' },
    ],
    selectedWidgetSize: 'FULL',
    //
    variablesSnapshot: {} as IDashboardVariables,
    variableSchemaSnapshot: {} as DashboardVariablesSchema,
    basedOnDateSnapshot: {} as DateRange,
});

/* Util */
const initSnapshot = () => {
    state.variablesSnapshot = cloneDeep(dashboardDetailState.variables);
    state.variableSchemaSnapshot = cloneDeep(dashboardDetailGetters.refinedVariablesSchema);
    state.basedOnDateSnapshot = cloneDeep(dashboardDetailState.settings.date_range);
};

/* Event */
const handleChangeWidgetSize = (widgetSize: string) => {
    state.selectedWidgetSize = widgetSize;
};

onBeforeMount(() => {
    initSnapshot();
});
</script>

<template>
    <div class="sidebar-contents">
        <div class="left-part">
            <div class="dashboard-settings-wrapper">
                <div class="toolbox-wrapper">
                    <dashboard-toolset-date-dropdown :date-range="dashboardDetailState.settings.date_range" />
                    <p-divider vertical
                               class="divider"
                    />
                    <dashboard-variables disable-more-button
                                         disable-save-button
                                         :origin-variables="state.variablesSnapshot"
                                         :origin-variables-schema="state.variableSchemaSnapshot"
                    />
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
                <component :is="getWidgetComponent(widgetGenerateState.selectedChartType)"
                           :widget-name="widgetGenerateState.selectedChartType"
                           :widget-id="widgetGenerateState.widgetId"
                           size="lg"
                           :title="widgetGenerateState.title"
                           :description="widgetGenerateState.description"
                />
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
            }
            .widget-size-wrapper {
                display: flex;
                gap: 0.5rem;
            }
        }
        .widget-wrapper {
            &.full-size {
                height: 100%;
                .widget-frame {
                    height: 100%;
                }
            }
        }
    }
}
</style>
