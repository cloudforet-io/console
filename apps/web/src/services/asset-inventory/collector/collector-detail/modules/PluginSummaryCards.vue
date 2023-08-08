<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { Location } from 'vue-router';

import { PCopyButton, PFieldTitle } from '@spaceone/design-system';

import { iso8601Formatter } from '@cloudforet/core-lib';

import { store } from '@/store';

import type { CollectorModel, JobModel } from '@/services/asset-inventory/collector/model';
import RecentCollectorJobList from '@/services/asset-inventory/collector/shared/RecentCollectorJobList.vue';

const props = defineProps<{
    collector?: CollectorModel|null;
    recentJobs?: JobModel[]|null;
    historyLink: Location
}>();

const state = reactive({
    timezone: computed(() => store.state.user.timezone),
});
</script>

<template>
    <div class="plugin-summary-cards">
        <div class="plugin-summary-card">
            <p-field-title size="sm"
                           color="gray"
                           font-weight="regular"
            >
                {{ $t('INVENTORY.COLLECTOR.DETAIL.PLUGIN_ID') }}
            </p-field-title>
            <div class="contents">
                <p-copy-button>
                    {{ props.collector?.plugin_info?.plugin_id }}
                </p-copy-button>
            </div>
        </div>
        <div class="plugin-summary-card">
            <p-field-title size="sm"
                           color="gray"
                           font-weight="regular"
            >
                {{ $t('INVENTORY.COLLECTOR.DETAIL.CREATED') }}
            </p-field-title>
            <div class="contents">
                {{ iso8601Formatter(props.collector?.created_at, state.timezone) }}
            </div>
        </div>
        <div class="plugin-summary-card">
            <recent-collector-job-list :recent-jobs="props.recentJobs"
                                       :history-link="props.historyLink"
                                       full-mode
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.plugin-summary-cards {
    @apply flex flex-wrap;
    gap: 0.5rem;
    width: 100%;
    margin-bottom: 1.5rem;
    .p-field-title {
        margin-bottom: 0.25rem;
    }
    .plugin-summary-card {
        @apply relative rounded-md bg-gray-100;
        padding: 0.75rem;
        flex-grow: 1;
        max-width: 21.5rem;
        min-width: 15rem;
        height: 4.75rem;
        .contents {
            @apply text-paragraph-md;
        }
    }
}
</style>
