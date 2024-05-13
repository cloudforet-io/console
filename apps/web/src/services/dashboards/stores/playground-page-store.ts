import { reactive } from 'vue';

import { defineStore } from 'pinia';


export const useDashboardPlaygroundStore = defineStore('dashboard-playground', () => {
    const state = reactive({
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
    });

    return {
        state,
    };
});
