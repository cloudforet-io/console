<template>
    <div class="info-item">
        <p class="info-label">
            {{ $t('INVENTORY.COLLECTOR.MAIN.RECENT_JOBS') }}
            <p-tooltip
                :contents="$t('INVENTORY.COLLECTOR.MAIN.RECENT_JOBS_TOOLTIP')"
                position="top-end"
            >
                <p-i name="ic_question-mark-circle"
                     class="title-tooltip"
                     height="0.875rem"
                     width="0.875rem"
                     color="inherit"
                />
            </p-tooltip>
        </p>
        <div class="jobs-wrapper">
            <div class="jobs-contents"
                 @click.stop
            >
                <collector-job-status-icon v-for="(jobStatus, index) in props.item.recentJobAnalyze"
                                           :key="`job-item-${index}`"
                                           class="collector-job-status-icon-wrapper"
                                           :status="jobStatus.status"
                                           :contents="$t('INVENTORY.COLLECTOR.MAIN.JOB_SUCCESS', {date: dayjs.utc(jobStatus.finished_at).tz(storeState.timezone).format('YYYY-MM-DD hh:mm:ss')})"
                                           :to="{ name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY.JOB._NAME, params: { jobId: jobStatus.job_id} }"
                />
            </div>
            <collector-job-status-icon is-arrow
                                       :to="props.item.historyLink"
                                       class="more-button"
                                       :contents="$t('INVENTORY.COLLECTOR.MAIN.VIEW_HISTORY_DETAIL')"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PTooltip, PI } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { store } from '@/store';

import type { CollectorItemInfo } from '@/services/asset-inventory/collector/collector-main/type';
import CollectorJobStatusIcon
    from '@/services/asset-inventory/collector/shared/CollectorJobStatusIcon.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

interface Props {
    item?: CollectorItemInfo;
}

const props = withDefaults(defineProps<Props>(), {
    item: undefined,
});

const storeState = reactive({
    timezone: computed(() => store.state.user.timezone),
});
</script>

<style lang="postcss" scoped>
.info-item {
    @apply items-end;
    .info-label {
        @apply flex items-center text-label-sm text-gray-500;
        gap: 0.25rem;

        .title-tooltip {
            &:hover {
                @apply text-blue-600;
            }
        }
    }

    .jobs-wrapper {
        @apply flex;

        .jobs-contents {
            @apply flex items-center justify-center;
        }
        .collector-job-status-icon-wrapper, .more-button {
            margin-left: -0.25rem;
        }
        .more-button {
            @apply border-gray-200;
        }
    }
}
</style>
