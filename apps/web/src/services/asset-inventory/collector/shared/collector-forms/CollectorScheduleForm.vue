<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldGroup, PButton, PFieldTitle, PToggleButton, PDataLoader,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import { range, size } from 'lodash';
import {
    defineProps, defineEmits, reactive, computed, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

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

const emits = defineEmits<{(event: 'update:enableHoursEdit', value: boolean): void;
}>();
const store = useStore();
const { t } = useI18n();

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
            showSuccessMessage(t('INVENTORY.COLLECTOR.ALT_S_UPDATE_SCHEDULE'), '');
        } catch (e) {
            collectorFormStore.resetSchedulePower();
            ErrorHandler.handleRequestError(e, t('INVENTORY.COLLECTOR.ALT_E_UPDATE_SCHEDULE'));
        }
    }
};

const handleClickSelect = () => {
    emits('update:enableHoursEdit', true);
};

const handleClickHour = (hour: number) => {
    if (props.disabled) return;
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

watch(() => collectorFormStore.collectorId, (collectorId) => {
    if (props.resetOnCollectorIdChange && !collectorId) return;
    collectorFormStore.resetSchedule();
    selectedUtcHoursSet.clear();
    collectorFormState.scheduleHours.forEach((hour) => {
        selectedUtcHoursSet.add(hour);
    });
}, { immediate: true });

</script>

<template>
    <p-data-loader :loading="state.loading"
                   :data="true"
                   show-data-from-scratch
                   class="collector-schedule-edit-form"
    >
        <p-field-title :label="t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE_ON_OFF')"
                       :description="t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE_TURN_ON_DESC')"
                       class="schedule-desc"
        />
        <p-toggle-button :value="collectorFormState.schedulePower"
                         :disabled="props.disabled"
                         @change-toggle="handleChangeToggle"
        />
        <div v-if="!props.enableHoursEdit && collectorFormState.schedulePower"
             class="collect-data-desc"
        >
            <i18n-t v-if="state.timezoneAppliedHours.length > 0"
                    keypath="INVENTORY.COLLECTOR.DETAIL.SCHEDULE_COLLECT_DESC"
                    tag="p"
            >
                <template #times>
                    <span class="times">{{ state.timezoneAppliedHoursDisplayText }}</span>
                </template>
            </i18n-t>
            <template v-else>
                {{ t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE_NOT_SELECTED_YET') }}
                <p-button style-type="tertiary"
                          size="sm"
                          @click="handleClickSelect"
                >
                    {{ t('INVENTORY.COLLECTOR.DETAIL.SELECT') }}
                </p-button>
            </template>
        </div>
        <p-field-group v-if="props.enableHoursEdit"
                       class="hourly-schedule-field-group"
                       :label="t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE_HOURLY')"
                       :help-text="t('INVENTORY.COLLECTOR.MAIN.TIMEZONE') + ': ' + state.timezone"
        >
            <div class="hourly-schedule-wrapper">
                <span v-for="(hour) in hoursMatrix"
                      :key="hour"
                      class="time-block"
                      :class="{
                          active: !!state.timezoneAppliedHours.includes(hour),
                          disabled: props.disabled
                      }"
                      @click="handleClickHour(hour)"
                >
                    {{ hour }}
                </span>
                <p-button style-type="tertiary"
                          :disabled="props.disabled"
                          @click="handleClickAllHours"
                >
                    {{ t('INVENTORY.COLLECTOR.DETAIL.ALL') }}
                </p-button>
            </div>
        </p-field-group>
    </p-data-loader>
</template>

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
        &:hover:not(.disabled) {
            @apply bg-secondary2 border-secondary text-secondary;
        }
        &.active {
            @apply bg-safe text-white;
        }
        &.disabled {
            cursor: not-allowed;
        }
    }
}
</style>
