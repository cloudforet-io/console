<script setup lang="ts">
import { computed, onActivated, reactive } from 'vue';

import { PTab } from '@spaceone/design-system';

import type { JobTaskModel } from '@/schema/inventory/job-task/model';
import { i18n } from '@/translations';

import JobTaskErrorList from '@/services/asset-inventory/components/CollectorHistoryJobTaskErrorList.vue';


interface Props {
    selectedItem: Partial<JobTaskModel>;
}

const props = withDefaults(defineProps<Props>(), {
    selectedItem: () => ({}),
});

const state = reactive({
    tabs: computed(() => [
        { name: 'error-list', label: i18n.t('MANAGEMENT.COLLECTOR_HISTORY.JOB.ERROR_LIST'), keepAlive: true },
    ]),
    activeTab: 'error-list',
});

onActivated(() => {
    state.activeTab = 'error-list';
});

</script>

<template>
    <p-tab class="job-task-details"
           :tabs="state.tabs"
           :active-tab.sync="state.activeTab"
    >
        <template #error-list>
            <job-task-error-list :selected-item="props.selectedItem" />
        </template>
    </p-tab>
</template>

<style lang="postcss" scoped>
.job-task-details {
    @apply border border-gray-200 rounded-xs;
    padding-bottom: 2.375rem;
    min-height: 27.5rem;
}
</style>
