<template>
    <div class="collector-schedule-edit-form">
        <p-field-title :label="$t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE_ON_OFF')"
                       :description="$t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE_TURN_ON_DESC')"
                       class="schedule-desc"
        />
        <p-toggle-button :value="state.isAutoSchedule"
                         @change-toggle="handleChangeToggle"
        />
        <i18n v-if="!props.editMode"
              path="INVENTORY.COLLECTOR.DETAIL.SCHEDULE_COLLECT_DESC"
              tag="p"
              class="collect-data-desc"
        >
            <template #times>
                <span class="times">{{ state.timezoneAppliedHours.map(hour => `${hour}:00`).join(', ') }}</span>
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
                      :class="{active: !!state.timezoneAppliedHours.includes(hour)}"
                      @click="handleClickHour(hour)"
                >
                    {{ hour }}
                </span>
                <p-button class="all-button"
                          :class="[state.isAllHoursSelected ? 'all-selected' : '']"
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
import {
    defineProps, defineEmits, reactive, computed, watch,
} from 'vue';

import {
    PFieldGroup, PButton, PFieldTitle, PToggleButton,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import { range, size } from 'lodash';

import { store } from '@/store';

const props = defineProps<{
    editMode?: boolean;
    utcHours?: string[];
}>();

const emits = defineEmits<{(event: 'update:hours', value: string[]): void;
}>();

const hoursMatrix: string[] = range(24).map((hour) => hour.toString());
const selectedUtcHoursSet = new Set<string>();
const state = reactive({
    timezone: computed<string>(() => store.state.user.timezone),
    isAutoSchedule: true,
    isAllHoursSelected: computed<boolean>(() => state.selectedUtcHours.length === size(hoursMatrix)),
    selectedUtcHours: [] as string[],
    timezoneAppliedHours: computed<string[]>(() => {
        if (state.timezone === 'UTC') return state.selectedUtcHours;
        // set an hour as utc and get the hour in timezone
        return state.selectedUtcHours.map((utcHour) => dayjs.utc()
            .hour(Number(utcHour)).tz(state.timezone)
            .get('hour')
            .toString()).sort((a, b) => Number(a) - Number(b));
    }),
});

const updateSelectedHoursAndEmit = () => {
    const hours: string[] = Array.from(selectedUtcHoursSet.values());
    state.selectedUtcHours = hours;
    emits('update:hours', hours);
};

const handleChangeToggle = () => {
    // TODO: change state of toggle button
};

const handleClickHour = (hour: string) => {
    let utcHour: string;
    if (state.timezone === 'UTC') utcHour = hour;
    else {
        // set an hour as timezone and get the hour in utc
        utcHour = dayjs().tz(state.timezone)
            .hour(Number(hour)).utc()
            .get('hour')
            .toString();
    }
    if (selectedUtcHoursSet.has(utcHour)) {
        selectedUtcHoursSet.delete(utcHour);
    } else {
        selectedUtcHoursSet.add(utcHour);
    }

    updateSelectedHoursAndEmit();
};
const handleClickAllHours = () => {
    if (state.isAllHoursSelected) selectedUtcHoursSet.clear();
    else {
        hoursMatrix.forEach((hour) => {
            selectedUtcHoursSet.add(hour);
        });
    }

    updateSelectedHoursAndEmit();
};

// reset selected hours and selected hours set every time editMode is changed
watch(() => props.editMode, () => {
    selectedUtcHoursSet.clear();
    props.utcHours?.forEach((hour) => {
        selectedUtcHoursSet.add(hour);
    });
    state.selectedUtcHours = [...(props.utcHours ?? [])];
}, { immediate: true });

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
