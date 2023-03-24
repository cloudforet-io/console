<template>
    <p-tab class="job-task-details"
           :tabs="tabs"
           :active-tab.sync="activeTab"
    >
        <template #error-list>
            <job-task-error-list :selected-item="selectedItem" />
        </template>
    </p-tab>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, onActivated, reactive, toRefs,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { PTab } from '@spaceone/design-system';

import JobTaskErrorList from '@/services/asset-inventory/collector/collector-history/collect-job/modules/JobTaskErrorList.vue';
import type { JobTaskData } from '@/services/asset-inventory/collector/collector-history/collect-job/type';

export default {
    name: 'JobTaskDetails',
    components: {
        PTab,
        JobTaskErrorList,
    },
    props: {
        selectedItem: {
            type: Object as () => JobTaskData,
            default: () => ({}),
            required: true,
        },
    },
    setup() {
        const vm = getCurrentInstance()?.proxy as Vue;
        const state = reactive({
            tabs: computed(() => [
                { name: 'error-list', label: vm.$t('MANAGEMENT.COLLECTOR_HISTORY.JOB.ERROR_LIST'), keepAlive: true },
            ]),
            activeTab: 'error-list',
        });

        onActivated(() => {
            state.activeTab = 'error-list';
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.job-task-details {
    @apply border border-gray-200 rounded-xs;
    padding-bottom: 2.375rem;
    min-height: 27.5rem;
}
</style>
