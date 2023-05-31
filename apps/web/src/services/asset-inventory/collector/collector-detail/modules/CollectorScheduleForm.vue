<template>
    <div class="collector-schedule-edit-form">
        <p-field-title :label="$t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE_ON_OFF')"
                       :description="$t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE_TURN_ON_DESC')"
                       class="schedule-desc"
        />
        <p-toggle-button :value="state.isAutoSchedule"
                         @change-toggle="handleChangeToggle"
        />
        <i18n v-if="!props.editHours"
              path="INVENTORY.COLLECTOR.DETAIL.SCHEDULE_COLLECT_DESC"
              tag="p"
              class="collect-data-desc"
        >
            <template #times>
                <!-- TODO: change times with real data -->
                <span class="times">00:00, 04:00, 08:00, 12:00, 16:00, 20:00</span>
            </template>
        </i18n>
        <p-field-group v-else
                       class="hourly-schedule-field-group"
                       :label="$t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE_HOURLY')"
        >
            <div class="hourly-schedule-wrapper">
                <span v-for="(hour) in hoursMatrix"
                      :key="hour"
                      class="time-block"
                      :class="{active: state.selectedHours[hour] }"
                      @click="handleClickHour(hour)"
                >
                    {{ hour }}
                </span>
                <p-button class="all-button"
                          :class="[state.isAllHours ? 'all-selected' : '']"
                          style-type="highlight"
                          @click="handleClickAllHours"
                >
                    {{ $t('INVENTORY.COLLECTOR.DETAIL.ALL') }}
                </p-button>
            </div>
        </p-field-group>
    </div>
</template>

<script lang="ts" setup>
import { defineProps, reactive, computed } from 'vue';

import {
    PFieldGroup, PButton, PFieldTitle, PToggleButton,
} from '@spaceone/design-system';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { range, size } from 'lodash';

import { store } from '@/store';

interface ScheduleHours {
    [time: string]: Dayjs;
}

const props = defineProps<{
    editHours: boolean;
}>();

const hoursMatrix = range(24);
const state = reactive({
    timezone: computed(() => store.state.user.timezone),
    isAutoSchedule: true,
    // TODO: remove temporary data
    selectedHours: { 1: dayjs() } as ScheduleHours,
    isAllHours: computed(() => size(state.selectedHours) === 24),
});

const handleChangeToggle = () => {
    // TODO: change state of toggle button
};

const handleClickHour = () => {
    // TODO: change state of selected hours
};
const handleClickAllHours = () => {
    // TODO: change state of all hours
};

</script>

<style lang="postcss" scoped>
.collector-schedule-edit-form {
    .schedule-desc {
        margin-bottom: 0.5rem;
    }
    .collect-data-desc {
        @apply text-paragraph-md font-normal;
        margin-top: 0.5rem;
        margin-bottom: 1.5rem;
        .times {
            @apply font-bold;
        }
    }
}
.hourly-schedule-field-group {
    margin-top: 1.5rem;
}
.hourly-schedule-wrapper {
    display: grid;
    gap: 0.5rem;
    grid-template-columns: repeat(12, 2rem);
    grid-template-rows: auto;

    .time-block {
        @apply bg-white border border-gray-300 rounded-xs;
        display: inline-block;
        height: 2rem;
        line-height: 2rem;
        text-align: center;
        font-size: 0.875rem;
        cursor: pointer;
        &:hover {
            @apply bg-secondary2 border-secondary text-secondary;
        }
        &.active {
            @apply bg-safe text-white;
        }
    }
    .all-button {
        @apply bg-white text-black border-gray-300;
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
        vertical-align: unset;
        &:hover {
            @apply bg-secondary2 border-secondary text-secondary;
        }
        &.all-selected {
            @apply bg-gray-900 text-white;
            border: none;
        }
    }
}
</style>
