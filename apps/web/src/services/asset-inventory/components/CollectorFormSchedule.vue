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
                         show-state-text
                         :read-only="props.readonly"
                         @change-toggle="handleChangeToggle"
        />
        <p-field-group v-if="collectorFormState.schedulePower"
                       class="hourly-schedule-field-group"
                       :required="props.hoursReadonly || props.readonly"
                       :label="$t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE_HOURLY')"
                       :help-text="$t('INVENTORY.COLLECTOR.MAIN.TIMEZONE') + ': ' + state.timezone"
        >
            <div class="hourly-schedule-wrapper"
                 :class="{'is-read-mode': props.hoursReadonly || props.readonly}"
            >
                <span v-for="(hour) in hoursMatrix"
                      :key="hour"
                      class="time-block"
                      :class="{
                          active: !!state.timezoneAppliedHours.includes(hour)
                      }"
                      @click="handleClickHour(hour)"
                >
                    {{ hour }}
                </span>
            </div>
            <span v-if="state.isScheduleError"
                  class="error-msg"
            >
                {{ $t('INVENTORY.COLLECTOR.ALT_E_COLLECTOR_SCHEDULE') }}
            </span>
        </p-field-group>
    </p-data-loader>
</template>

<script lang="ts" setup>
import {
    defineProps, reactive, computed, watch,
} from 'vue';

import dayjs from 'dayjs';
import { range, size } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldGroup, PFieldTitle, PToggleButton, PDataLoader,
} from '@cloudforet/mirinae';

import type { CollectorUpdateParameters } from '@/schema/inventory/collector/api-verbs/update';
import type { CollectorModel } from '@/schema/inventory/collector/model';
import { i18n as i18nTranslator } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useCollectorFormStore } from '@/services/asset-inventory/stores/collector-form-store';


const props = defineProps<{
    hoursReadonly?: boolean;
    readonly?: boolean;
    disableLoading?: boolean;
    resetOnCollectorIdChange?: boolean;
    callApiOnPowerChange?: boolean;
}>();

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.state;
const userStore = useUserStore();

const hoursMatrix: number[] = range(24);
const selectedUtcHoursSet = new Set<number>();
const state = reactive({
    timezone: computed<string|undefined>(() => userStore.state.timezone),
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
    isScheduleError: computed<boolean>(() => collectorFormState.isScheduleError),
});

const updateSelectedHours = () => {
    const hours: number[] = Array.from(selectedUtcHoursSet.values());
    collectorFormStore.$patch((_state) => {
        _state.state.scheduleHours = hours;
    });
};
const fetchCollectorUpdate = async (): Promise<CollectorModel> => {
    if (!collectorFormState.collectorId) throw new Error('collector_id is not defined');
    const hours = collectorFormState.originCollector?.schedule?.hours ?? [];
    const params: CollectorUpdateParameters = {
        collector_id: collectorFormState.collectorId,
        schedule: {
            hours,
            state: collectorFormState.schedulePower ? 'ENABLED' : 'DISABLED',
        },
    };
    return SpaceConnector.clientV2.inventory.collector.update<CollectorUpdateParameters, CollectorModel>(params);
};

const handleChangeToggle = async (value: boolean) => {
    collectorFormStore.$patch((_state) => {
        _state.state.schedulePower = value;
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
    if (props.hoursReadonly || props.readonly) return;
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
        collectorFormStore.$patch((_state) => {
            _state.state.isScheduleError = false;
        });
    } else {
        if (selectedUtcHoursSet?.size >= 2) {
            collectorFormStore.$patch((_state) => {
                _state.state.isScheduleError = true;
            });
            return;
        }
        selectedUtcHoursSet.add(utcHour);
        collectorFormStore.$patch((_state) => {
            _state.state.isScheduleError = false;
        });
    }

    updateSelectedHours();
};

watch([() => collectorFormState.collectorId, () => props.hoursReadonly], ([collectorId]) => {
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
    min-height: 4.2rem;
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
    .error-msg {
        @apply block w-full text-label-sm text-alert;
        margin-top: 0.25rem;
    }
}
.hourly-schedule-wrapper {
    display: grid;
    gap: 0.5rem;
    grid-template-columns: repeat(12, 2rem);
    grid-template-rows: auto;

    @screen mobile {
        grid-template-columns: repeat(4, 2rem);
    }

    &.is-read-mode {
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
    }
}
</style>
