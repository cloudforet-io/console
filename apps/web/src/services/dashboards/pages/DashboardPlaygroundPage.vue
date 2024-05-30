<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PSelectDropdown, PTextInput, PFieldGroup, PButton,
} from '@spaceone/design-system';

import type {
    DashboardVariablesSchema, DashboardVariables, DataSource,
} from '@/schema/dashboard/_types/dashboard-type';

import PieChart from '@/common/modules/widgets/_base-widgets/pie-chart/PieChart.vue';
import StackedColumnChart from '@/common/modules/widgets/_base-widgets/stacked-column-chart/StackedColumnChart.vue';
import WidgetFormOverlay from '@/common/modules/widgets/_components/WidgetFormOverlay.vue';
import { NEW_CONSOLE_WIDGET_CONFIG_KEYS } from '@/common/modules/widgets/_constants/widget-config-list-constant';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';

import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';
import {
    useAllReferenceTypeInfoStore,
} from '@/services/dashboards/stores/all-reference-type-info-store';


const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();
const widgetGenerateStore = useWidgetGenerateStore();

const state = reactive({
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
    widgetConfig: computed(() => getWidgetConfig(formState.selectedChartName)),
    dataSources: [
        {
            resource_type: 'cost_analysis.Cost',
            value: 'ds-3d5b2ed535c7',
        },
        {
            resource_type: 'inventory.MetricData',
            value: 'metric-aws-ec2-instance-count',
        },
    ] as DataSource[],
    variablesSchema: {} as DashboardVariablesSchema,
    variables: {} as DashboardVariables,
    baseOnDate: '2024-05',
    chartTypeSelectDropdownMenu: computed(() => NEW_CONSOLE_WIDGET_CONFIG_KEYS.map((d) => ({
        name: d,
        label: d,
    }))),
});
const formState = reactive({
    title: '',
    description: '',
    selectedChartName: 'stackedColumnChart',
    dataMapping: {},
    chartOptions: {},
});

/* Event */
const handleClickAddWidget = () => {
    widgetGenerateStore.setShowOverlay(true);
};

watch(() => state.widgetConfig, (_config) => {
    formState.title = _config?.meta.title || '';
}, { immediate: true });
</script>

<template>
    <div>
        <p>Widget Playground</p>
        <br>
        <p>Based on Date</p>
        <p class="text-label-md">
            {{ state.baseOnDate }}
        </p>
        <br>
        <p-button style-type="tertiary"
                  class="mb-2"
                  @click="handleClickAddWidget"
        >
            Add Widget
        </p-button>
        <div class="grid grid-cols-12">
            <div class="col-span-8">
                <stacked-column-chart v-if="formState.selectedChartName === 'stackedColumnChart'"
                                      :widget-name="formState.selectedChartName"
                                      :widget-key="formState.selectedChartName"
                                      :title="formState.title"
                                      size="lg"
                                      :description="formState.description"
                                      :base-on-date="state.baseOnDate"
                                      :data-sources="state.dataSources"
                                      :data-mapping="formState.dataMapping"
                                      :chart-options="formState.chartOptions"
                                      :variables="state.variables"
                />
                <pie-chart v-if="formState.selectedChartName === 'pieChart'"
                           :widget-name="formState.selectedChartName"
                           :widget-key="formState.selectedChartName"
                           :title="formState.title"
                           size="lg"
                           :description="formState.description"
                           :base-on-date="state.baseOnDate"
                           :data-sources="state.dataSources"
                           :data-mapping="formState.dataMapping"
                           :chart-options="formState.chartOptions"
                           :variables="state.variables"
                />
            </div>
            <div class="col-span-4 px-2">
                <div class="pb-4">
                    <b>Data Source</b>
                    <p v-for="dataSource in state.dataSources"
                       :key="`${dataSource.resource_type}-${dataSource.value}`"
                       class="text-label-md"
                    >
                        {{ dataSource.resource_type }} {{ dataSource.value }}
                    </p>
                </div>
                <div class="pb-4">
                    <b>Widget Info</b>
                    <p-field-group label="Title"
                                   required
                    >
                        <p-text-input :value="formState.title"
                                      @update:value="formState.title = $event"
                        />
                    </p-field-group>
                    <p-field-group label="Description">
                        <p-text-input :value="formState.description"
                                      @update:value="formState.description = $event"
                        />
                    </p-field-group>
                </div>
                <div class="pb-4">
                    <b>Chart Type</b>
                    <div>
                        <p-select-dropdown
                            :menu="state.chartTypeSelectDropdownMenu"
                            :selected="formState.selectedChartName"
                            @select="formState.selectedChartName = $event"
                        />
                    </div>
                </div>
                <div class="pb-4">
                    <b>Data Mapping</b>
                    <div>
                        TODO: Set dynamic data fields, group by...
                    </div>
                </div>
                <div class="pb-4">
                    <b>Chart Options</b>
                    <div>
                        TODO: Set dynamic Chart Options...
                    </div>
                </div>
            </div>
        </div>
        <widget-form-overlay overlay-type="ADD" />
    </div>
</template>
