<script setup lang="ts">
import {
    PPaneLayout, PHeading, PToggleButton,
} from '@cloudforet/mirinae';

import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

const taskManagementTemplateStore = useTaskManagementTemplateStore();

const handleUpdateEnableLanding = (value: boolean) => {
    if (value === taskManagementTemplateStore.state.enableLanding) {
        return;
    }
    taskManagementTemplateStore.updateLandingData(value);
};
</script>

<template>
    <p-pane-layout class="p-4">
        <p-heading class="mb-2"
                   :title="$t('OPSFLOW.TASK_MANAGEMENT.ENABLE_LANDING')"
                   heading-type="sub"
        />
        <p class="mb-4 text-label-md text-gray-600">
            {{ $t('OPSFLOW.TASK_MANAGEMENT.ENABLE_LANDING_DESC') }}
        </p>
        <p-toggle-button show-state-text
                         :value="taskManagementTemplateStore.state.enableLanding"
                         @update:value="handleUpdateEnableLanding"
        />
    </p-pane-layout>
</template>
