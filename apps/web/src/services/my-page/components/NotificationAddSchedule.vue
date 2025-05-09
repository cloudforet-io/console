<script setup lang="ts">
import {
    computed, reactive, onMounted, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { range } from 'lodash';

import {
    PRadio, PSelectButton, PSelectDropdown, PRadioGroup,
} from '@cloudforet/mirinae';

import type { ChannelSchedule, ChannelScheduleDayOfWeek } from '@/schema/notification/type';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import InfoMessage from '@/common/components/guidance/InfoMessage.vue';
import type { ScheduleSettingFormType } from '@/common/components/schedule-setting-form/schedule-setting-form';
import ScheduleSettingForm from '@/common/components/schedule-setting-form/ScheduleSettingForm.vue';
import { useFormValidator } from '@/common/composables/form-validator';

import {
    timezoneToUtcFormatter,
    utcToTimezoneFormatter,
} from '@/services/iam/helpers/user-notification-timezone-helper';
import type { NotificationAddFormSchedulePayload } from '@/services/my-page/types/notification-add-form-type';

const START_TIME_LIST = range(0, 24);
const END_TIME_LIST = range(1, 25);

const props = withDefaults(defineProps<{
    isScheduledValid?: boolean;
    isScheduled?: boolean;
    schedule?: Partial<ChannelSchedule> & Partial<ScheduleSettingFormType>;
    visibleUserNotification: boolean;
}>(), {
    isScheduledValid: true,
    isScheduled: false,
    schedule: undefined,
    visibleUserNotification: false,
});

const emit = defineEmits<{(event: 'changeV1', payload: NotificationAddFormSchedulePayload): void;
  (event: 'change', payload: ScheduleSettingFormType): void;
}>();


const userStore = useUserStore();
const timezone = computed<string|undefined>(() => userStore.state.timezone);

/* constants */
const WEEK_DAYS = [
    { label: 'Monday', value: 'MON' }, { label: 'Tuesday', value: 'TUE' }, { label: 'Wednesday', value: 'WED' },
    { label: 'Thursday', value: 'THU' }, { label: 'Friday', value: 'FRI' },
    { label: 'Saturday', value: 'SAT' }, { label: 'Sunday', value: 'SUN' },
];
const START_TIME_MENU = START_TIME_LIST.map((d) => ({
    type: 'item', label: `${d}:00`, name: timezoneToUtcFormatter(d, timezone.value),
}));
const END_TIME_MENU = END_TIME_LIST.map((d) => ({
    type: 'item', label: `${d}:00`, name: timezoneToUtcFormatter(d, timezone.value),
}));


/* form states */
interface TimePeriod {
    startHour: number;
    endHour: number;
}
const {
    forms: {
        daysOfWeek, timePeriod,
    },
    invalidState,
    setForm,
    resetAll,
} = useFormValidator({
    daysOfWeek: props.schedule?.day_of_week ?? ['MON', 'TUE', 'WED', 'THU', 'FRI'] as ChannelScheduleDayOfWeek[],
    timePeriod: {
        startHour: props.schedule?.start_hour ?? timezoneToUtcFormatter(9, timezone.value),
        endHour: props.schedule?.end_hour ?? timezoneToUtcFormatter(18, timezone.value),
    }as TimePeriod,
}, {
    daysOfWeek(value: ChannelScheduleDayOfWeek[]) {
        return value.length > 0;
    },
    timePeriod(value: TimePeriod) {
        if (utcToTimezoneFormatter(value.endHour, timezone.value) === 0) return true;
        return utcToTimezoneFormatter(value.startHour, timezone.value) < utcToTimezoneFormatter(value.endHour, timezone.value);
    },
});


const state = reactive({
    scheduleMode: computed<{label: TranslateResult; value: boolean}[]>(() => [{
        label: i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALL_TIME'), value: false,
    }, {
        label: i18n.t('IDENTITY.USER.NOTIFICATION.FORM.CUSTOM'), value: true,
    }]),
    proxyIsScheduled: props.isScheduled ? props.isScheduled : false,
    proxyIsScheduledValid: computed<boolean>(() => !state.proxyIsScheduled || (!invalidState.daysOfWeek && !invalidState.timePeriod)),
    scheduleSettingTypeData: {
        SCHEDULE_TYPE: 'WEEK_DAY',
        TIMEZONE: 'UTC',
        MON: {
            is_scheduled: true,
        },
        TUE: {
            is_scheduled: true,
        },
        WED: {
            is_scheduled: true,
        },
        THU: {
            is_scheduled: true,
        },
        FRI: {
            is_scheduled: true,
        },
    } as ScheduleSettingFormType,
});

const emitChange = () => {
    if (!props.visibleUserNotification) {
        if (state.proxyIsScheduled) {
            emit('changeV1', {
                schedule: {
                    day_of_week: daysOfWeek.value,
                    start_hour: timePeriod.value.startHour,
                    end_hour: timePeriod.value.endHour,
                },
                is_scheduled: state.proxyIsScheduled,
                isScheduleValid: state.proxyIsScheduledValid,
            });
        } else {
            emit('changeV1', {
                schedule: {},
                is_scheduled: state.proxyIsScheduled,
                isScheduleValid: state.proxyIsScheduledValid,
            });
        }
    }
};

const handleScheduleMode = (value: boolean) => {
    state.proxyIsScheduled = value;
    emitChange();
};

const handleSelectDay = (days: ChannelScheduleDayOfWeek[]) => {
    setForm('daysOfWeek', days);
    emitChange();
};

const handleSelectStartHour = (startHour: number) => {
    setForm('timePeriod', { ...timePeriod.value, startHour });
    emitChange();
};

const handleSelectEndHour = (endHour: number) => {
    setForm('timePeriod', { ...timePeriod.value, endHour });
    emitChange();
};

const handleScheduleForm = (scheduleSettingFormType: ScheduleSettingFormType) => {
    state.scheduleSettingTypeData = scheduleSettingFormType;
    emit('change', scheduleSettingFormType);
};

watch(() => props.schedule, (schedule) => {
    if (schedule) {
        state.scheduleSettingTypeData = schedule;
    }
}, { deep: true, immediate: true });

onMounted(() => {
    resetAll();
});
</script>

<template>
    <div>
        <div v-if="!props.visibleUserNotification">
            <p-radio-group>
                <p-radio v-for="(item, i) in state.scheduleMode"
                         :key="i"
                         :selected="item.value"
                         :value="state.proxyIsScheduled"
                         @click="handleScheduleMode(item.value)"
                >
                    <span class="radio-label"
                          @click="handleScheduleMode(item.value)"
                    >{{ item.label }}</span>
                </p-radio>
            </p-radio-group>
            <article v-if="state.proxyIsScheduled"
                     class="schedule-wrapper"
            >
                <info-message style-type="secondary"
                              :message="$t('IDENTITY.USER.NOTIFICATION.FORM.SCHEDULE_INFO_MSG')"
                              block
                />
                <h5 class="setting">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SETTING') }}
                </h5>
                <p-select-button v-for="day in WEEK_DAYS"
                                 :key="day.value"
                                 :selected="daysOfWeek"
                                 multi-selectable
                                 :value="day.value"
                                 class="select-button-wrapper"
                                 @change="handleSelectDay"
                >
                    {{ day.label }}
                </p-select-button>
                <div class="dropdown-wrapper">
                    <p-select-dropdown :selected="timePeriod.startHour"
                                       :menu="START_TIME_MENU"
                                       :invalid="invalidState.timePeriod"
                                       class="dropdown"
                                       use-fixed-menu-style
                                       @select="handleSelectStartHour"
                    />
                    <span class="text">{{ $t('IDENTITY.USER.NOTIFICATION.FORM.TO') }}</span>
                    <p-select-dropdown :selected="timePeriod.endHour"
                                       :menu="END_TIME_MENU"
                                       :invalid="invalidState.timePeriod"
                                       class="dropdown"
                                       use-fixed-menu-style
                                       @select="handleSelectEndHour"
                    />
                    <span class="timezone-text">{{ $t('COMMON.PROFILE.TIMEZONE') }}: {{ timezone }}</span>
                </div>
            </article>
        </div>
        <div v-else>
            <schedule-setting-form :schedule-form="state.scheduleSettingTypeData"
                                   @update-form="handleScheduleForm"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.radio-label {
    font-size: 0.875rem;
    line-height: 150%;
}
.schedule-wrapper {
    margin-top: 1.25rem;
    .setting {
        @apply font-bold;
        font-size: 0.875rem;
        line-height: 140%;
        margin-bottom: 1.125rem;
    }
}
.select-button-wrapper {
    margin-right: 0.5rem;
    margin-bottom: 1rem;
}
.dropdown-wrapper {
    display: flex;
    align-items: center;
    .text {
        @apply mx-2;
        font-size: 0.875rem;
        line-height: 160%;
    }
    .timezone-text {
        @apply text-gray-600;
        margin-left: 1rem;
        font-size: 0.75rem;
        line-height: 150%;
    }
}
</style>
