<script lang="ts" setup>
import { computed, reactive } from 'vue';

import type { DashboardSettings, DashboardVariablesSchema, DashboardVariables } from '@/schema/dashboard/_types/dashboard-type';

import VerticalBarChart from '@/common/modules/widgets/_base-widgets/vertical-bar-chart/VerticalBarChart.vue';

import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';
import {
    useAllReferenceTypeInfoStore,
} from '@/services/dashboards/stores/all-reference-type-info-store';


const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();

const state = reactive({
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
    dataSourceList: [
        {
            resource_type: 'cost_analysis.Cost',
            value: 'ds-3d5b2ed535c7',
        },
        {
            resource_type: 'inventory.MetricData',
            value: 'metric-aws-ec2-instance-count',
        },
    ],
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
});
</script>

<template>
    <div>
        <p>Widget Playground</p>
        <br>
        <p>Data Source List</p>
        <p class="text-label-md">
            {{ state.dataSourceList }}
        </p>
        <p>settings</p>
        <p class="text-label-md">
            {{ state.settings }}
        </p>
        <br>
        <vertical-bar-chart :all-reference-type-info="state.allReferenceTypeInfo"
                            :data-source-list="state.dataSourceList"
                            :settings="state.settings"
                            :variables-schema="state.variablesSchema"
                            :variables="state.variables"
                            title="Vertical Bar Chart"
        />
    </div>
</template>
