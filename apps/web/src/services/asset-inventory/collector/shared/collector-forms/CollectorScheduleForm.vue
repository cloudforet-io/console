<template>
    <p-data-loader :loading="state.loading"
                   :data="true"
                   show-data-from-scratch
                   class="collector-schedule-edit-form"
    >
        <p-field-title :label="$t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE_ON_OFF')"
                       :description="$t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE_TURN_ON_DESC')"
                       class="schedule-desc"
        />
        <br>
        <p-toggle-button :value="collectorFormState.schedulePower"
                         @change-toggle="handleChangeToggle"
        />
        <div v-if="!props.editMode"
             class="collect-data-desc"
        >
            <i18n v-if="state.timezoneAppliedHours.length > 0"
                  path="INVENTORY.COLLECTOR.DETAIL.SCHEDULE_COLLECT_DESC"
                  tag="p"
            >
                <template #times>
                    <span class="times">{{ state.timezoneAppliedHours.map(hour => `${hour}:00`).join(', ') }}</span>
                </template>
            </i18n>
            <template v-else>
                {{ $t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE_NOT_SELECTED_YET') }}
                <p-button style-type="tertiary"
                          size="sm"
                          @click="handleClickSelect"
                >
                    {{ $t('INVENTORY.COLLECTOR.DETAIL.SELECT') }}
                </p-button>
            </template>
        </div>
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
                <p-button style-type="tertiary"
                          @click="handleClickAllHours"
                >
                    {{ $t('INVENTORY.COLLECTOR.DETAIL.ALL') }}
                </p-button>
            </div>
        </p-field-group>
    </p-data-loader>
</template>

<script lang="ts" setup>
import {
    defineProps, defineEmits, reactive, computed, watch,
} from 'vue';

import {
    PFieldGroup, PButton, PFieldTitle, PToggleButton, PDataLoader,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import { range, size } from 'lodash';

import { store } from '@/store';

import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';

const props = defineProps<{
    editMode?: boolean;
}>();

const emits = defineEmits<{(event: 'update:editMode', value: boolean): void;
}>();

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const hoursMatrix: number[] = range(24);
const selectedUtcHoursSet = new Set<number>();
const state = reactive({
    timezone: computed<string>(() => store.state.user.timezone),
    isAllHoursSelected: computed<boolean>(() => collectorFormState.scheduleHours.length === size(hoursMatrix)),
    timezoneAppliedHours: computed<number[]>(() => {
        if (state.timezone === 'UTC') return collectorFormState.scheduleHours;
        // set an hour as utc and get the hour in timezone
        return collectorFormState.scheduleHours.map((utcHour) => dayjs.utc()
            .hour(utcHour).tz(state.timezone)
            .get('hour')).sort((a, b) => a - b);
    }),
    loading: computed<boolean>(() => collectorFormState.originCollector === null),
});

const updateSelectedHours = () => {
    const hours: number[] = Array.from(selectedUtcHoursSet.values());
    collectorFormStore.$patch({
        scheduleHours: hours,
    });
};

const handleChangeToggle = (value: boolean) => {
    collectorFormStore.$patch({
        schedulePower: value,
    });
    // TODO: update with api call
};

const handleClickSelect = () => {
    emits('update:editMode', true);
};

const handleClickHour = (hour: number) => {
    let utcHour: number;
    if (state.timezone === 'UTC') utcHour = hour;
    else {
        // set an hour as timezone and get the hour in utc
        utcHour = dayjs().tz(state.timezone)
            .hour(hour).utc()
            .get('hour');
    }
    if (selectedUtcHoursSet.has(utcHour)) {
        selectedUtcHoursSet.delete(utcHour);
    } else {
        selectedUtcHoursSet.add(utcHour);
    }

    updateSelectedHours();
};
const handleClickAllHours = () => {
    if (state.isAllHoursSelected) selectedUtcHoursSet.clear();
    else {
        hoursMatrix.forEach((hour) => {
            selectedUtcHoursSet.add(hour);
        });
    }

    updateSelectedHours();
};

// init values with data from originCollector when originCollector changed
watch(() => collectorFormState.originCollector, () => {
    collectorFormStore.resetSchedule();
    selectedUtcHoursSet.clear();
    collectorFormState.scheduleHours.forEach((hour) => {
        selectedUtcHoursSet.add(hour);
    });
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
    margin-bottom: 1.875rem;
}
.hourly-schedule-wrapper {
    display: grid;
    gap: 0.5rem;
    grid-template-columns: repeat(12, 2rem);
    grid-template-rows: auto;

    @screen mobile {
        grid-template-columns: repeat(4, 2rem);
    }

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
}
</style>
