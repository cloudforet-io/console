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
    ComponentRenderProxy, computed, getCurrentInstance, onActivated, reactive, toRefs,
} from '@vue/composition-api';
import { PTab } from '@spaceone/design-system';
import JobTaskErrorList from '@/services/management/collector-history/collect-job/modules/JobTaskErrorList.vue';

interface Props {
  selectedItem: any;
}
export default {
    name: 'JobTaskDetails',
    components: {
        PTab,
        JobTaskErrorList,
    },
    props: {
        selectedItem: {
            type: Object,
            default: () => ({}),
            required: true,
        },
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
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
