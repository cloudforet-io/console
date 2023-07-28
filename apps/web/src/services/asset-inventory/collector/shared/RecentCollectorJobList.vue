<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PTooltip, PI } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { store } from '@/store';

import { isMobile } from '@/lib/helper/cross-browsing-helper';

import type { CollectorLink } from '@/services/asset-inventory/collector/collector-main/type';
import CollectorJobStatusIcon
    from '@/services/asset-inventory/collector/shared/CollectorJobStatusIcon.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

interface MinimalJobInfo {
    job_id: string;
    status: string;
    finished_at: string;
}
interface Props {
    recentJobs?: MinimalJobInfo[];
    historyLink?: CollectorLink;
}

const props = withDefaults(defineProps<Props>(), {
    recentJobs: undefined,
    historyLink: undefined,
});

const storeState = reactive({
    timezone: computed(() => store.state.user.timezone),
});
</script>

<template>
    <div class="recent-collector-job-list">
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
        <div :class="['jobs-wrapper', { 'is-mobile': isMobile() }]">
            <div class="jobs-contents">
                <collector-job-status-icon v-for="(job, index) in props.recentJobs"
                                           :key="`job-item-${index}`"
                                           :class="['collector-job-status-icon-wrapper', { 'is-mobile': isMobile() }]"
                                           :status="job.status"
                                           :contents="$t('INVENTORY.COLLECTOR.MAIN.JOB_SUCCESS', {date: dayjs.utc(job.finished_at).tz(storeState.timezone).format('YYYY-MM-DD hh:mm:ss')})"
                                           :to="{ name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY.JOB._NAME, params: { jobId: job.job_id} }"
                />
            </div>
            <collector-job-status-icon is-arrow
                                       :to="props.historyLink"
                                       class="more-button"
                                       :class="['more-button', { 'is-mobile': isMobile() }]"
                                       :contents="$t('INVENTORY.COLLECTOR.MAIN.VIEW_HISTORY_DETAIL')"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.recent-collector-job-list {
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
        &.is-mobile {
            @apply relative;
            .jobs-contents {
                &::before {
                    @apply absolute;
                    content: '';
                    top: 0;
                    bottom: 0;
                    left: -1rem;
                    width: calc(100% + 1rem);
                    background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 10%);
                }
            }
            .collector-job-status-icon-wrapper {
                margin-left: -0.375rem;
                z-index: 1;
            }
            .more-button {
                display: none;
                opacity: 0;
            }
        }
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
