<template>
    <div class="info-item">
        <p class="info-label">
            {{ $t('INVENTORY.COLLECTOR.MAIN.CURRENT_STATUS') }}
        </p>
        <div class="label-description">
            <div v-if="props.item.schedule">
                <div v-if="state.status === JOB_STATE.SUCCESS && props.item.schedule.hours && props.item.schedule.hours.length > 0"
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
                        {{ $t('INVENTORY.COLLECTOR.MAIN.SCHEDULED') }}
                        <span class="emphasis">
                            {{ $t('INVENTORY.COLLECTOR.MAIN.SCHEDULED_TIME', {hr: state.diffSchedule.diffHour, m: state.diffSchedule.diffMin }) }}
                        </span>
                    </p>
                </div>
                <span v-else-if="state.status === JOB_STATE.IN_PROGRESS"
                      class="current-status-progress"
                >
                    {{ $t('INVENTORY.COLLECTOR.MAIN.IN_PROGRESS') }} - <span class="remained-task">{{ state.remained_tasks }}%</span>
                </span>
                <span v-else>
                    {{ $t('INVENTORY.COLLECTOR.MAIN.NO_SCHEDULE') }}
                </span>
            </div>
            <span v-else>
                {{ $t('INVENTORY.COLLECTOR.MAIN.NO_SCHEDULE') }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PI } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { numberFormatter } from '@cloudforet/core-lib';

import { store } from '@/store';

import type { CollectorItemInfo } from '@/services/asset-inventory/collector/collector-main/type';
import { JOB_STATE } from '@/services/asset-inventory/collector/collector-main/type';

const RECENT_COUNT = 5;

interface Props {
    item?: CollectorItemInfo;
}

const props = withDefaults(defineProps<Props>(), {
    item: undefined,
});

const storeState = reactive({
    timezone: computed(() => store.state.user.timezone),
});

const state = reactive({
    status: computed(() => props.item?.recentJobAnalyze[props.item.recentJobAnalyze.length - 1].status),
    diffSchedule: computed(() => {
        if (props.item.schedule) {
            const current = dayjs().utc();

            const userCurrentTime = dayjs.tz(current, storeState.timezone);
            const hours = props.item.schedule.hours ?? [];
            const sortedHours = hours.sort((a, b) => a - b);
            const nextScheduledHour = sortedHours.find((num) => num > userCurrentTime.hour());

            let nextScheduledTime;
            if (nextScheduledHour) {
                nextScheduledTime = current.set('h', nextScheduledHour || 0).set('m', 0);
            } else {
                nextScheduledTime = current.add(1, 'day').set('h', sortedHours[0]).set('m', 0);
            }
            const timeDiff = nextScheduledTime.diff(current, 'm');
            return { diffHour: Math.floor(timeDiff / 60), diffMin: timeDiff % 60 };
        }
        return { diffHour: 0, diffMin: 0 };
    }),
    remained_tasks: computed(() => {
        const recentJob = props.item.recentJobAnalyze[RECENT_COUNT - 1];
        return recentJob.total_tasks > 0 ? numberFormatter(((recentJob.total_tasks - recentJob.remained_tasks) / recentJob.total_tasks) * 100) : 100;
    }),
});
</script>

<style lang="postcss" scoped>
.info-item {
    .info-label {
        @apply text-label-sm text-gray-500;
    }

    .label-description {
        @apply text-label-md text-gray-700;
        min-height: 2.25rem;

        @screen tablet {
            min-height: initial;
        }

        .scheduled {
            @apply flex items-center;
            gap: 0.25rem;

            .emphasis {
                @apply block font-bold text-gray-900 not-italic;

                @screen tablet {
                    @apply inline; }
            }

            .alarm-icon {
                margin-bottom: auto;
                min-width: 1.25rem;
            }

            .current-status-progress {
                @apply flex items-center;
                gap: 0.25rem;

                .setting-icon {
                    @apply text-gray-400;
                    min-width: 1.25rem;
                }
            }
        }

        .remained-task {
            @apply text-label-md font-bold text-gray-900;
        }
    }
}
</style>
