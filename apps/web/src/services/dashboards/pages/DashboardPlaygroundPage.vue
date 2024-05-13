<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PSelectDropdown, PTextInput, PFieldGroup,
} from '@spaceone/design-system';

import type {
    DashboardSettings, DashboardVariablesSchema, DashboardVariables, DataSource,
} from '@/schema/dashboard/_types/dashboard-type';

import VerticalBarChart from '@/common/modules/widgets/_base-widgets/vertical-bar-chart/VerticalBarChart.vue';

import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';
import {
    useAllReferenceTypeInfoStore,
} from '@/services/dashboards/stores/all-reference-type-info-store';


const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();

const state = reactive({
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
    dataSources: [
        {
            data_domain: 'Cost',
            resource_type: 'cost_analysis.Cost',
            value: ['ds-3d5b2ed535c7'],
        },
        {
            data_domain: 'Asset',
            resource_type: 'inventory.MetricData',
            value: ['metric-aws-ec2-instance-count'],
        },
    ] as DataSource[],
    variablesSchema: {} as DashboardVariablesSchema,
    variables: {} as DashboardVariables,
    settings: {
        date_range: {
            enabled: true,
            start: '',
            end: '',
        },
        refresh_interval_option: 'off',
    } as DashboardSettings,
    chartTypeSelectDropdownMenu: [
        { name: 'verticalBarChart', label: 'Vertical Bar Chart' },
        { name: 'horizontalBarChart', label: 'Horizontal Bar Chart' },
        { name: 'lineChart', label: 'Line Chart' },
        { name: 'pieChart', label: 'Pie Chart' },
        { name: 'treemapChart', label: 'Treemap Chart' },
    ],
});
const formState = reactive({
    title: 'Vertical Bar Chart',
    description: '',
    selectedChartType: 'verticalBarChart',
    dataMapping: {},
    chartOptions: {},
});
</script>

<template>
    <div>
        <p>Widget Playground</p>
        <br>
        <p>settings</p>
        <p class="text-label-md">
            {{ state.settings }}
        </p>
        <br>
        <div class="grid grid-cols-12">
            <div class="col-span-8">
                <vertical-bar-chart v-if="formState.selectedChartType === 'verticalBarChart'"
                                    :widget-name="formState.selectedChartType"
                                    :widget-key="formState.selectedChartType"
                                    :title="formState.title"
                                    size="lg"
                                    :description="formState.description"
                                    :data-sources="state.dataSources"
                                    :data-mapping="formState.dataMapping"
                                    :chart-options="formState.chartOptions"
                                    :variables-schema="state.variablesSchema"
                                    :variables="state.variables"
                />
            </div>
            <div class="col-span-4 px-2">
                <div class="pb-4">
                    <b>Data Source</b>
                    <p v-for="dataSource in state.dataSources"
                       :key="`${dataSource.data_domain}-${dataSource.resource_type}-${dataSource.value}`"
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
                            :selected="formState.selectedChartType"
                            @select="formState.selectedChartType = $event"
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
    </div>
</template>
