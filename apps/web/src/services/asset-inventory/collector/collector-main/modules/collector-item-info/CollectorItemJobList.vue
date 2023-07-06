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
            <div v-for="(jobStatus, index) in props.item.recentJobAnalyze"
                 :key="`job-item-${index}`"
                 class="jobs-contents"
                 @click.stop
            >
                <router-link :to="{ name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY.JOB._NAME, params: { jobId: jobStatus.job_id} }"
                             class="icon-fill-wrapper"
                >
                    <p-tooltip v-if="jobStatus.status === JOB_STATE.SUCCESS"
                               :contents="$t('INVENTORY.COLLECTOR.MAIN.JOB_SUCCESS', {date: dayjs.utc(jobStatus.finished_at).tz(storeState.timezone).format('YYYY-MM-DD hh:mm:ss')})"
                               position="top-end"
                               class="job-tooltip"
                    >
                        <p-i
                            name="ic_check"
                            class="icon success"
                            height="1rem"
                            width="1rem"
                            color="inherit"
                        />
                    </p-tooltip>
                    <p-tooltip v-else-if="jobStatus.status === JOB_STATE.CANCELED"
                               :contents="$t('INVENTORY.COLLECTOR.MAIN.JOB_CANCELED', {date: dayjs.utc(jobStatus.finished_at).tz(storeState.timezone).format('YYYY-MM-DD hh:mm:ss')})"
                               position="top-end"
                               class="job-tooltip"
                    >
                        <p-i
                            name="ic_limit-filed"
                            class="icon canceled"
                            height="1rem"
                            width="1rem"
                            color="inherit"
                        />
                    </p-tooltip>
                    <p-tooltip v-else
                               :contents="$t('INVENTORY.COLLECTOR.MAIN.JOB_ERROR', {date: dayjs.utc(jobStatus.finished_at).tz(storeState.timezone).format('YYYY-MM-DD hh:mm:ss')})"
                               position="top-end"
                               class="job-tooltip"
                    >
                        <p-i
                            name="ic_exclamation-mark"
                            class="icon error"
                            height="1rem"
                            width="1rem"
                            color="inherit"
                        />
                    </p-tooltip>
                </router-link>
            </div>
            <router-link :to="props.item.historyLink"
                         class="jobs-contents history"
            >
                <p-tooltip :contents="$t('INVENTORY.COLLECTOR.MAIN.VIEW_HISTORY_DETAIL')"
                           position="top-end"
                           class="job-tooltip"
                >
                    <p-i
                        name="ic_chevron-right"
                        width="1.125rem"
                        height="1.125rem"
                        color="inherit"
                    />
                </p-tooltip>
            </router-link>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PTooltip, PI } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { store } from '@/store';

import type { CollectorItemInfo } from '@/services/asset-inventory/collector/collector-main/type';
import { JOB_STATE } from '@/services/asset-inventory/collector/collector-main/type';
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
            @apply flex items-center justify-center bg-gray-100 rounded-full border border-white;
            width: 1.5rem;
            height: 1.5rem;
            margin-left: -0.25rem;
            &:hover {
                @apply bg-blue-200;
                .icon-fill-wrapper, .job-tooltip {
                    @apply text-blue-600;
                    .icon {
                        &.success {
                            @apply text-blue-600;
                        }
                        &.error {
                            @apply text-blue-600;
                        }
                        &.canceled {
                            @apply text-blue-600;
                        }
                    }
                }
            }
            .icon-fill-wrapper {
                @apply rounded box-border;
                width: 1rem;
                height: 1rem;
                margin: auto;
                .job-tooltip {
                    @apply flex items-center justify-center;
                }
                .icon {
                    &.success {
                        @apply text-green-500;
                        margin-right: -0.25rem;
                    }
                    &.error {
                        @apply text-red-400;
                    }
                    &.canceled {
                        @apply text-gray-400;
                    }
                }
            }
        }
    }
}
</style>
