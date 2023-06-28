<script lang="ts" setup>
import { PTab } from '@spaceone/design-system';
import {
    computed, onActivated, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

import JobTaskErrorList from '@/services/asset-inventory/collector/collector-history/collect-job/modules/JobTaskErrorList.vue';
import type { JobTaskData } from '@/services/asset-inventory/collector/collector-history/collect-job/type';

interface Props {
    selectedItem: JobTaskData;
}

withDefaults(defineProps<Props>(), {
    selectedItem: () => ({}) as JobTaskData,
});
const { t } = useI18n();

const state = reactive({
    tabs: computed(() => [
        { name: 'error-list', label: t('MANAGEMENT.COLLECTOR_HISTORY.JOB.ERROR_LIST'), keepAlive: true },
    ]),
    activeTab: 'error-list',
});

onActivated(() => {
    state.activeTab = 'error-list';
});

</script>

<template>
    <p-tab v-model:active-tab="state.activeTab"
           class="job-task-details"
           :tabs="state.tabs"
    >
        <template #error-list>
            <job-task-error-list :selected-item="selectedItem" />
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
