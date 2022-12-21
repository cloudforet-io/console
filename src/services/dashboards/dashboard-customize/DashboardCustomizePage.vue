<template>
    <div class="dashboard-customize-page">
        CUSTOMIZE DASHBOARD
        <div class="flex justify-between">
            <dashboard-labels editable
                              :label-list="state.labelList"
                              @update:labelList="handleUpdateLabelList"
            />
            <dashboard-toolset />
        </div>
        <p-divider />
        <dashboard-refresh-dropdown :interval-option.sync="state.refreshInterval"
                                    refresh-disabled
        />
        <dashboard-customize-sidebar />
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import { PDivider } from '@spaceone/design-system';

import DashboardCustomizeSidebar from '@/services/dashboards/dashboard-customize/modules/DashboardCustomizeSidebar.vue';
import DashboardLabels from '@/services/dashboards/modules/dashboard-label/DashboardLabels.vue';
import DashboardToolset from '@/services/dashboards/modules/dashboard-toolset/DashboardToolset.vue';
import DashboardRefreshDropdown from '@/services/dashboards/modules/DashboardRefreshDropdown.vue';

const state = reactive({
    labelList: [] as Array<string>,
    refreshInterval: undefined,
});

const handleUpdateLabelList = (labelList: Array<string>) => {
    state.labelList = labelList;
};
</script>
