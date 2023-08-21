<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PTooltip, PI, PEmpty, PAnchor, PDataLoader,
} from '@spaceone/design-system';
import dayjs from 'dayjs';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { CollectorLink } from '@/services/asset-inventory/collector/collector-main/type';
import CollectorJobStatusIcon
    from '@/services/asset-inventory/collector/shared/CollectorJobStatusIcon.vue';
import { JOB_STATE } from '@/services/asset-inventory/collector/type';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

interface MinimalJobInfo {
    job_id: string;
    status: string;
    finished_at: string;
}
interface Props {
    recentJobs?: MinimalJobInfo[];
    historyLink?: CollectorLink;
    fullMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    recentJobs: undefined,
    historyLink: undefined,
});

const storeState = reactive({
    timezone: computed(() => store.state.user.timezone),
});

const state = reactive({
    loading: true,
    completedJobs: computed<MinimalJobInfo[]|undefined>(() => {
        if (Array.isArray(props.recentJobs) && props.recentJobs.length > 0) {
            return props.recentJobs.filter((job) => job.status !== JOB_STATE.IN_PROGRESS)
                .sort((a, b) => dayjs(b.finished_at).unix() - dayjs(a.finished_at).unix())
                .slice(0, 5)
                .reverse();
        }
        return undefined;
    }),
});

const handleTooltipContent = (job: MinimalJobInfo) => {
    const { status, finished_at } = job;
    let content = '';
    if (status === JOB_STATE.SUCCESS) content = 'INVENTORY.COLLECTOR.MAIN.JOB_SUCCESS';
    if (status === JOB_STATE.CANCELED) content = 'INVENTORY.COLLECTOR.MAIN.JOB_CANCELED';
    if (status === JOB_STATE.FAILURE) content = 'INVENTORY.COLLECTOR.MAIN.JOB_FAILURE';
    return i18n.t(content, { date: dayjs.utc(finished_at).tz(storeState.timezone).format('YYYY-MM-DD hh:mm:ss') });
};

watch(() => props.recentJobs, () => {
    state.loading = !Array.isArray(props.recentJobs);
});
</script>

<template>
    <div class="recent-collector-job-list"
         :class="{'full-mode': props.fullMode}"
    >
        <div class="header">
            <p class="info-label">
                {{ $t('INVENTORY.COLLECTOR.MAIN.RECENT_JOBS') }}
                <p-tooltip
                    :contents="$t('INVENTORY.COLLECTOR.MAIN.RECENT_JOBS_TOOLTIP')"
                    position="top-start"
                >
                    <p-i name="ic_question-mark-circle"
                         class="title-tooltip"
                         height="0.875rem"
                         width="0.875rem"
                         color="inherit"
                    />
                </p-tooltip>
            </p>
            <p-anchor v-if="props.fullMode && props.historyLink"
                      size="sm"
                      highlight
                      icon-name="ic_chevron-right"
                      :to="props.historyLink"
            >
                View All
            </p-anchor>
        </div>
        <p-data-loader :data="!!state.completedJobs?.length"
                       :loading="state.loading"
                       loader-type="skeleton"
                       class="data-loader"
        >
            <div v-if="state.completedJobs"
                 class="jobs-wrapper"
            >
                <div class="jobs-contents">
                    <collector-job-status-icon v-for="(job, index) in state.completedJobs"
                                               :key="`job-item-${index}`"
                                               class="collector-job-status-icon-wrapper"
                                               :status="job.status"
                                               :contents="handleTooltipContent(job)"
                                               :to="{ name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY.JOB._NAME, params: { jobId: job.job_id} }"
                                               :style-type="props.fullMode ? 'white' : 'gray'"
                    />
                </div>
                <collector-job-status-icon v-if="state.completedJobs.length > 0 && !props.fullMode && props.historyLink"
                                           is-arrow
                                           :to="props.historyLink"
                                           class="more-button"
                                           :contents="$t('INVENTORY.COLLECTOR.MAIN.VIEW_HISTORY_DETAIL')"
                />
            </div>
            <template #no-data>
                <p-empty class="empty-case">
                    {{ $t('INVENTORY.COLLECTOR.NO_JOB') }}
                </p-empty>
            </template>
        </p-data-loader>
    </div>
</template>

<style lang="postcss" scoped>
.recent-collector-job-list {
    @apply items-end;
    .header {
        display: flex;
        justify-content: space-between;
        flex-shrink: 0;
        margin-bottom: 0.25rem;
        .info-label {
            @apply flex items-center text-label-sm text-gray-500;
            gap: 0.25rem;
            .title-tooltip {
                &:hover {
                    @apply text-blue-600;
                }
            }
        }
    }
    .data-loader {
        min-height: 1.125rem;
    }
    .jobs-wrapper {
        display: flex;
        justify-content: flex-end;

        @screen mobile {
            .jobs-contents {
                @apply relative;
                &::before {
                    @apply absolute;
                    content: '';
                    top: 0;
                    bottom: 0;
                    left: -10%;
                    width: 10%;
                    background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.5) 20%);
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
    .empty-case {
        display: flex;
        align-items: flex-end;
        width: 100%;
    }
    &.full-mode {
        position: initial;
        .header {
            margin-bottom: 0.5rem;
        }
        .jobs-wrapper {
            justify-content: flex-start;
            .jobs-contents {
                flex-wrap: wrap;
                gap: 0.25rem;
                justify-content: flex-start;
            }
            .collector-job-status-icon-wrapper {
                margin: 0;
            }
        }
        .empty-case {
            align-items: flex-start;
        }
    }

    @screen mobile {
        @apply absolute;
        top: 0;
        right: 0;
    }
}
</style>
