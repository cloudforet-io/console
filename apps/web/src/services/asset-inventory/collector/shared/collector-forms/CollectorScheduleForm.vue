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
        <p-toggle-button :value="collectorFormState.schedulePower"
                         :disabled="props.disabled"
                         show-state-text
                         @change-toggle="handleChangeToggle"
        />
        <p-field-group v-if="collectorFormState.schedulePower || props.enableHoursEdit"
                       class="hourly-schedule-field-group"
                       :required="!props.enableHoursEdit"
                       :label="$t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE_HOURLY')"
                       :help-text="$t('INVENTORY.COLLECTOR.MAIN.TIMEZONE') + ': ' + state.timezone"
        >
            <div class="hourly-schedule-wrapper"
                 :class="{'is-set-mode': !props.enableHoursEdit}"
            >
                <span v-for="(hour) in hoursMatrix"
                      :key="hour"
                      class="time-block"
                      :class="{
                          active: !!state.timezoneAppliedHours.includes(hour),
                          disabled: props.disabled,
                      }"
                      @click="handleClickHour(hour)"
                >
                    {{ hour }}
                </span>
            </div>
        </p-field-group>
    </p-data-loader>
</template>

<script lang="ts" setup>
import {
    defineProps, reactive, computed, watch,
} from 'vue';

import {
    PFieldGroup, PFieldTitle, PToggleButton, PDataLoader,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import { range, size } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n as i18nTranslator } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CollectorModel, CollectorUpdateParameter } from '@/services/asset-inventory/collector/model';
import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';

const props = defineProps<{
    enableHoursEdit?: boolean;
    disableLoading?: boolean;
    disabled?: boolean;
    resetOnCollectorIdChange?: boolean;
    callApiOnPowerChange?: boolean;
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
    timezoneAppliedHoursDisplayText: computed(() => state.timezoneAppliedHours.map((hour) => `${hour}:00`).join(', ')),
    loading: computed<boolean>(() => {
        if (props.disableLoading) return false;
        return collectorFormState.originCollector === null;
    }),
});

const updateSelectedHours = () => {
    const hours: number[] = Array.from(selectedUtcHoursSet.values());
    collectorFormStore.$patch({
        scheduleHours: hours,
    });
};
const fetchCollectorUpdate = async (): Promise<CollectorModel> => {
    if (!collectorFormStore.collectorId) throw new Error('collector_id is not defined');
    const schedule = collectorFormState.originCollector?.schedule ?? {};
    const params: CollectorUpdateParameter = {
        collector_id: collectorFormStore.collectorId,
        schedule: {
            ...schedule,
            state: collectorFormState.schedulePower ? 'ENABLED' : 'DISABLED',
        },
    };
    return SpaceConnector.client.inventory.collector.update(params);
};

const handleChangeToggle = async (value: boolean) => {
    collectorFormStore.$patch({
        schedulePower: value,
    });
    if (props.callApiOnPowerChange) {
        try {
            const collector = await fetchCollectorUpdate();
            collectorFormStore.setOriginCollector(collector);
            showSuccessMessage(i18nTranslator.t('INVENTORY.COLLECTOR.ALT_S_UPDATE_SCHEDULE'), '');
        } catch (e) {
            collectorFormStore.resetSchedulePower();
            ErrorHandler.handleRequestError(e, i18nTranslator.t('INVENTORY.COLLECTOR.ALT_E_UPDATE_SCHEDULE'));
        }
    }
};

const handleClickHour = (hour: number) => {
    if (props.disabled) return;
    if (!props.enableHoursEdit) return;
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

watch([() => collectorFormStore.collectorId, () => props.enableHoursEdit], ([collectorId]) => {
    if (props.resetOnCollectorIdChange && !collectorId) return;
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

    &.is-set-mode {
        gap: 0.25rem;
        .time-block {
            @apply bg-gray-100 text-gray-100 border-none cursor-default;
            &.active {
                @apply bg-blue-200 text-blue-600;
            }
        }
    }

    .time-block {
        @apply flex items-center justify-center bg-white border border-gray-300 rounded-xs box-border cursor-pointer;
        height: 2rem;
        font-size: 0.875rem;
        &.active {
            @apply bg-blue-600 text-white;
        }
        &.disabled {
            @apply cursor-not-allowed;
        }
    }
}
</style>
