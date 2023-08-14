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
                        {{ $t('INVENTORY.COLLECTOR.MAIN.IN_PROGRESS') }} <span class="remained-task">{{ state.remainedTasksPercentage }}%</span>
                    </span>
                </div>
                <div v-else>
                    <div v-if="props.isScheduleActivated"
                         class="description-view"
                    >
                        <div v-if="props.schedule && props.schedule.hours && props.schedule.hours.length > 0"
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
                              class="no-schedule"
                        >
                            {{ $t('INVENTORY.COLLECTOR.MAIN.NO_SCHEDULE') }}
                        </span>
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
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PI, PProgressBar } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { numberFormatter } from '@cloudforet/core-lib';

import { peacock } from '@/styles/colors';

import type { JobAnalyzeStatus } from '@/services/asset-inventory/collector/collector-main/type';
import type { Schedule } from '@/services/asset-inventory/collector/model';
import { JOB_STATE } from '@/services/asset-inventory/collector/type';

const PROGRESS_BAR_COLOR = peacock[500];

interface Props {
    schedule?: Schedule;
    recentJob?: JobAnalyzeStatus|null;
    isScheduleActivated?: boolean;
}

const props = defineProps<Props>();

const state = reactive({
    status: computed<string|undefined>(() => props.recentJob?.status),
    diffSchedule: computed(() => {
        if (props.schedule) {
            const current = dayjs.utc();

            const hours = props.schedule.hours ?? [];
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
            return totalTasks > 0 ? numberFormatter(((totalTasks - remainedTasks) / totalTasks) * 100) : 100;
        }
        return 0;
    }),
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
