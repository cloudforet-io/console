<template>
    <div>
        <p-radio v-for="(item, i) in scheduleMode"
                 :key="i"
                 :selected="item.value"
                 :value="proxyIsScheduled"
                 class="mr-4"
                 @click="handleScheduleMode(item.value)"
        >
            <span class="radio-label"
                  @click="handleScheduleMode(item.value)"
            >{{ item.label }}</span>
        </p-radio>
        <article v-if="proxyIsScheduled"
                 class="schedule-wrapper"
        >
            <info-message style-type="secondary"
                          :message="$t('IDENTITY.USER.NOTIFICATION.FORM.SCHEDULE_INFO_MSG')"
                          block
            />
            <h5 class="setting">
                {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SETTING') }}
            </h5>
            <p-select-button v-for="day in weekDay"
                             :key="day.value"
                             :selected="dayOfWeek"
                             multi-selectable
                             :value="day.value"
                             class="select-button-wrapper"
                             @change="handleSelectDay"
            >
                {{ day.label }}
            </p-select-button>
            <div class="dropdown-wrapper">
                <p-select-dropdown :selected="timePeriod.startHour"
                                   :items="startTimeList"
                                   :invalid="invalidState.timePeriod"
                                   class="dropdown"
                                   use-fixed-menu-style
                                   @select="handleSelectStartHour"
                />
                <span class="text">{{ $t('IDENTITY.USER.NOTIFICATION.FORM.TO') }}</span>
                <p-select-dropdown :selected="timePeriod.endHour"
                                   :items="endTimeList"
                                   :invalid="invalidState.timePeriod"
                                   class="dropdown"
                                   use-fixed-menu-style
                                   @select="handleSelectEndHour"
                />
                <span class="timezone-text">{{ $t('COMMON.PROFILE.TIMEZONE') }}: {{ timezone }}</span>
            </div>
        </article>
    </div>
</template>

<script lang="ts">
import type { SetupContext } from 'vue';
import {
    computed, reactive, toRefs,
} from 'vue';

import {
    PRadio, PSelectButton, PSelectDropdown,
} from '@spaceone/design-system';
import { range } from 'lodash';

import { store } from '@/store';
import { i18n } from '@/translations';

import InfoMessage from '@/common/components/guidance/InfoMessage.vue';
import { useFormValidator } from '@/common/composables/form-validator';

import { timezoneToUtcFormatter, utcToTimezoneFormatter } from '@/services/administration/iam/user/lib/helper';

const START_TIME_LIST = range(0, 24);
const END_TIME_LIST = range(1, 25);

export default {
    name: 'AddNotificationSchedule',
    components: {
        PRadio,
        PSelectButton,
        InfoMessage,
        PSelectDropdown,
    },
    props: {
        isScheduledValid: {
            type: Boolean,
            default: true,
        },
        isScheduled: {
            type: Boolean,
            default: false,
        },
        schedule: {
            type: Object,
            default: null,
        },
    },
    setup(props, { emit }: SetupContext) {
        const timezoneForFormatter = computed(() => store.state.user.timezone).value;
        const {
            forms: {
                dayOfWeek, timePeriod,
            },
            invalidState,
            setForm,
        } = useFormValidator({
            dayOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI'] as string[],
            timePeriod: {
                startHour: props.schedule === null ? timezoneToUtcFormatter(9, timezoneForFormatter) : props.schedule.start_hour,
                endHour: props.schedule === null ? timezoneToUtcFormatter(18, timezoneForFormatter) : props.schedule.end_hour,
            },
        }, {
            dayOfWeek(value: string[]) {
                return value.length > 0;
            },
            timePeriod(value: { startHour: number, endHour: number }) {
                if (utcToTimezoneFormatter(value.endHour, timezoneForFormatter) === 0) return true;
                return utcToTimezoneFormatter(value.startHour, timezoneForFormatter) < utcToTimezoneFormatter(value.endHour, timezoneForFormatter);
            },
        });
        const state = reactive({
            scheduleMode: computed(() => [{
                label: i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALL_TIME'), value: false,
            }, {
                label: i18n.t('IDENTITY.USER.NOTIFICATION.FORM.CUSTOM'), value: true,
            }]),
            proxyIsScheduled: props.isScheduled ? props.isScheduled : false,
            weekDay: [{ label: 'Monday', value: 'MON' }, { label: 'Tuesday', value: 'TUE' }, { label: 'Wednesday', value: 'WED' },
                { label: 'Thursday', value: 'THU' }, { label: 'Friday', value: 'FRI' },
                { label: 'Saturday', value: 'SAT' },
                { label: 'Sunday', value: 'SUN' }],
            startTimeList: START_TIME_LIST.map((d) => ({
                type: 'item', label: `${d}:00`, name: timezoneToUtcFormatter(d, timezoneForFormatter),
            })),
            endTimeList: END_TIME_LIST.map((d) => ({
                type: 'item', label: `${d}:00`, name: timezoneToUtcFormatter(d, timezoneForFormatter),
            })),
            proxyIsScheduledValid: computed(() => !state.proxyIsScheduled || (!invalidState.dayOfWeek && !invalidState.timePeriod)),
            timezone: computed(() => store.state.user.timezone),
        });

        const emitChange = () => {
            if (state.proxyIsScheduled) {
                emit('change', {
                    schedule: {
                        day_of_week: dayOfWeek.value,
                        start_hour: timePeriod.value.startHour,
                        end_hour: timePeriod.value.endHour,
                    },
                    is_scheduled: state.proxyIsScheduled,
                    isScheduleValid: state.proxyIsScheduledValid,
                });
            } else {
                emit('change', {
                    schedule: {},
                    is_scheduled: state.proxyIsScheduled,
                    isScheduleValid: state.proxyIsScheduledValid,
                });
            }
        };

        const handleScheduleMode = (value) => {
            state.proxyIsScheduled = value;
            emitChange();
        };

        const handleSelectDay = (value) => {
            setForm('dayOfWeek', value);
            emitChange();
        };

        const handleSelectStartHour = (value) => {
            setForm('timePeriod', { ...timePeriod.value, startHour: value });
            emitChange();
        };

        const handleSelectEndHour = (value) => {
            setForm('timePeriod', { ...timePeriod.value, endHour: value });
            emitChange();
        };

        return {
            ...toRefs(state),
            handleScheduleMode,
            handleSelectDay,
            handleSelectStartHour,
            handleSelectEndHour,
            dayOfWeek,
            timePeriod,
            invalidState,
        };
    },
};
</script>

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
