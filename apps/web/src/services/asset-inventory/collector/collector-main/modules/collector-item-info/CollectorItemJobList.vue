<template>
    <div class="info-item">
        <p class="info-label">
            {{ $t('INVENTORY.COLLECTOR.MAIN.RECENT_JOBS') }}
        </p>
        <div class="jobs-wrapper">
            <div v-for="(jobStatus, index) in props.item.recentJobAnalyze"
                 :key="`job-item-${index}`"
                 class="jobs-contents"
                 @click.stop
            >
                <p-tooltip v-if="jobStatus.status === JOB_STATE.SUCCESS"
                           class="icon-fill-wrapper success"
                           :contents="$t('INVENTORY.COLLECTOR.MAIN.JOB_SUCCESS', {date: dayjs.utc(jobStatus.finished_at).tz(storeState.timezone).format('YYYY-MM-DD hh:mm:ss')})"
                           position="top"
                >
                    <router-link :to="{ name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY.JOB._NAME, params: { jobId: jobStatus.job_id} }">
                        <p-i
                            name="ic_check"
                            class="icon success"
                            height="1.125rem"
                            width="1.125rem"
                            color="inherit"
                        />
                    </router-link>
                </p-tooltip>
                <p-tooltip v-else-if="jobStatus.status === JOB_STATE.IN_PROGRESS"
                           class="icon-fill-wrapper progress"
                           :contents="$t('INVENTORY.COLLECTOR.MAIN.JOB_PROGRESS')"
                           position="top"
                >
                    <router-link :to="{ name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY.JOB._NAME, params: { jobId: jobStatus.job_id} }">
                        <p-i
                            name="ic_settings-filled"
                            class="icon progress"
                            height="1.125rem"
                            width="1.125rem"
                            color="inherit"
                        />
                    </router-link>
                </p-tooltip>
                <p-tooltip v-else-if="jobStatus.status === JOB_STATE.NONE"
                           class="icon-fill-wrapper none"
                           :contents="$t('INVENTORY.COLLECTOR.MAIN.JOB_NONE')"
                           position="top"
                />
                <router-link v-else
                             :to="{ name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY.JOB._NAME, params: { jobId: jobStatus.job_id} }"
                >
                    <p-tooltip class="icon-fill-wrapper error"
                               :contents="$t('INVENTORY.COLLECTOR.MAIN.JOB_ERROR', {date: dayjs.utc(jobStatus.finished_at).tz(storeState.timezone).format('YYYY-MM-DD hh:mm:ss')})"
                               position="top"
                    >
                        <span class="exclamation-mark">!</span>
                    </p-tooltip>
                </router-link>
            </div>
        </div>
        <p-text-button v-if="props.item.hasJobList"
                       style-type="highlight"
                       class="view-history-detail-wrapper"
                       @click.stop
        >
            <router-link :to="props.item.historyLink"
                         class="view-history-detail"
            >
                <span>{{ $t('INVENTORY.COLLECTOR.MAIN.VIEW_HISTORY_DETAIL') }}</span>
                <p-i
                    name="ic_chevron-right"
                    width="0.75rem"
                    height="0.75rem"
                    color="inherit transparent"
                />
            </router-link>
        </p-text-button>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PTooltip, PI, PTextButton } from '@spaceone/design-system';
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
    .info-label {
        @apply text-label-sm text-gray-500;
    }

    .jobs-wrapper {
        @apply flex;
        gap: 0.375rem;

        .jobs-contents {
            @apply flex;
            width: 1.125rem;
            height: 1.125rem;

            .icon-fill-wrapper {
                @apply relative rounded box-border;
                width: 1.125rem;
                height: 1.125rem;

                &:hover {
                    @apply cursor-default;
                }

                &.success {
                    @apply bg-green-600;

                    &:hover {
                        @apply bg-green-500 border border-green-700 cursor-pointer;
                    }
                }

                &.error {
                    @apply flex items-center justify-center bg-red-500;

                    .exclamation-mark {
                        @apply text-white text-label-md;
                    }

                    &:hover {
                        @apply bg-red-300 border border-red-700 cursor-pointer;
                    }
                }

                &.progress {
                    @apply bg-gray-500;

                    &:hover {
                        @apply border border-gray-700;

                        .progress {
                            top: -0.065rem;
                            left: -0.065rem;
                            animation: rotate 6s linear infinite;
                            transform-origin: 50% 50%;

                            @keyframes rotate {
                                100% {
                                    transform: rotate(360deg);
                                }
                            }
                        }
                    }
                }

                &.none {
                    @apply bg-gray-200;
                }

                .icon {
                    @apply absolute text-white;

                    &.success {
                        @apply text-white;
                        top: 50%;
                        left: 50%;
                        transform: translate(-35%, -50%);
                    }

                    &.progress {
                        top: 0;
                        left: 0;
                    }
                }
            }
        }
    }

    .view-history-detail-wrapper {
        padding: 0;

        .view-history-detail {
            @apply flex items-center text-label-sm;
            height: 1.875rem;
            margin-top: -0.5rem;
        }
    }
}
</style>
