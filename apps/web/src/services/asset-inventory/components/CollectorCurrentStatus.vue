<template>
    <div class="collector-current-status">
        <div class="info-item">
            <p class="info-label">
                {{ $t('INVENTORY.COLLECTOR.MAIN.CURRENT_STATUS') }}
            </p>
            <div class="label-description">
                <div v-if="state.status === JOB_STATE.IN_PROGRESS"
                     class="current-status-progress"
                >
                    <p-i
                        name="ic_peacock-gradient-circle"
                        height="1rem"
                        width="1rem"
                        animation="spin"
                    />
                    <span>
                        {{ $t('INVENTORY.COLLECTOR.MAIN.IN_PROGRESS') }} <span class="remained-task">{{ state.formattedRemainedTasks }}%</span>
                    </span>
                </div>
                <div v-else>
                    <div v-if="props.isScheduleActivated && !!props.hours?.length"
                         class="scheduled"
                    >
                        <p-i
                            name="ic_alarm-clock"
                            class="alarm-icon"
                            height="1.25rem"
                            width="1.25rem"
                            color="inherit"
                        />
                        <p class="description">
                            {{ $t('INVENTORY.COLLECTOR.MAIN.SCHEDULED') + " " + $t('INVENTORY.COLLECTOR.MAIN.SCHEDULED_TIME', {hr: state.diffSchedule.diffHour, m: state.diffSchedule.diffMin }) }}
                        </p>
                    </div>
                    <span v-else
                          class="no-schedule description-view"
                    >
                        {{ $t('INVENTORY.COLLECTOR.MAIN.NO_SCHEDULE') }}
                    </span>
                </div>
            </div>
        </div>
        <p-progress-bar :percentage="state.remainedTasksPercentage"
                        :color="PROGRESS_BAR_COLOR"
                        size="sm"
                        class="status-progress-bar"
        />
        <div v-if="state.status === JOB_STATE.IN_PROGRESS && props.isPopoverMode"
             class="mt-8"
        >
            <p-link :text="$t('INVENTORY.COLLECTOR.DETAIL.DETAIL_JOB_LINK')"
                    size="sm"
                    :to="state.detailJobLink"
                    highlight
                    action-icon="internal-link"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import dayjs from 'dayjs';

import { PI, PProgressBar, PLink } from '@cloudforet/mirinae';
import { numberFormatter } from '@cloudforet/utils';

import { useAppContextStore } from '@/store/app-context/app-context-store';


import { peacock } from '@/styles/colors';

import { JOB_STATE } from '@/services/asset-inventory/constants/collector-constant';
import { ADMIN_ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/admin/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import type { JobAnalyzeStatus } from '@/services/asset-inventory/types/collector-main-page-type';


const PROGRESS_BAR_COLOR = peacock[500];

interface Props {
    hours?: number[];
    recentJob?: JobAnalyzeStatus|null;
    isScheduleActivated?: boolean;
    isPopoverMode?: boolean;
}


const props = defineProps<Props>();
const appContextStore = useAppContextStore();

const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    status: computed<string|undefined>(() => props.recentJob?.status),
    diffSchedule: computed(() => {
        if (props.hours) {
            const current = dayjs.utc();

            const hours = props.hours ?? [];
            const sortedHours = hours.sort((a, b) => a - b);
            const nextScheduledHour = sortedHours.find((num) => num > current.hour());

            let nextScheduledTime;
            if (nextScheduledHour) {
                nextScheduledTime = current.set('h', nextScheduledHour || 0).set('m', 0);
            } else {
                nextScheduledTime = current.add(1, 'day').set('h', sortedHours[0]).set('m', 0);
            }

            const timeDiff = nextScheduledTime.diff(current, 'minute');
            return { diffHour: Math.floor(timeDiff / 60), diffMin: timeDiff % 60 };
        }
        return { diffHour: 0, diffMin: 0 };
    }),
    remainedTasksPercentage: computed<number>(() => {
        if (state.status === JOB_STATE.IN_PROGRESS) {
            const remainedTasks = props.recentJob?.remained_tasks ?? 0;
            const totalTasks = props.recentJob?.total_tasks ?? 0;
            return totalTasks > 0 ? ((totalTasks - remainedTasks) / totalTasks) * 100 : 100;
        }
        return 0;
    }),
    formattedRemainedTasks: computed<string>(() => {
        const remainedTasks = state.remainedTasksPercentage;
        return numberFormatter(remainedTasks);
    }),
    detailJobLink: computed(() => ({
        name: state.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY.JOB._NAME : ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY.JOB._NAME,
        params: { jobId: props.recentJob?.job_id ?? '' },
    })),
});
</script>

<style lang="postcss" scoped>
.collector-current-status {
    .info-item {
        @apply relative flex flex-col flex-wrap;
        width: 100%;
        min-height: 2.75rem;
        gap: 0.5rem;
        .info-label {
            @apply text-label-sm text-gray-500;
        }
        .label-description {
            @apply text-label-md text-gray-700;
            .scheduled {
                @apply flex items-center;
                gap: 0.25rem;
                .alarm-icon {
                    margin-bottom: auto;
                    min-width: 1.25rem;
                }
            }
            .no-schedule {
                @apply text-gray-300;
            }
            .current-status-progress {
                @apply flex items-center;
                gap: 0.25rem;
            }
            .remained-task {
                @apply text-label-md font-bold text-gray-900;
                margin-left: 0.25rem;
            }
        }
    }
    .status-progress-bar {
        @apply absolute;
        width: calc(100% - 3rem);
        margin-top: 1.125rem;
    }

    @screen mobile {
        width: 100%;
    }
}
</style>
