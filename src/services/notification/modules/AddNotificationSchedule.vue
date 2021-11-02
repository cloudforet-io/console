<template>
    <div>
        <p-radio v-for="(item, i) in scheduleMode" :key="i"
                 :selected="item.value" :value="proxyIsScheduled" class="mr-4"
                 @click="changeScheduleMode(item.value)"
        >
            <span class="radio-label" @click="changeScheduleMode(item.value)">{{ item.label }}</span>
        </p-radio>
        <article v-if="proxyIsScheduled" class="schedule-wrapper">
            <info-message style-type="secondary"
                          :message="$t('IDENTITY.USER.NOTIFICATION.FORM.SCHEDULE_INFO_MSG')"
                          block
            />
            <h5 class="setting">
                {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SETTING') }}
            </h5>
            <p-select-button v-for="day in weekDay" :key="day.value"
                             v-model="proxySchedule.day_of_week"
                             multi-selectable
                             :value="day.value"
                             class="select-button-wrapper"
                             @change="onSelectDay"
            >
                {{ day.label }}
            </p-select-button>
            <div class="dropdown-wrapper">
                <p-select-dropdown :selected="proxySchedule.start_hour"
                                   :items="startTimeList"
                                   :invalid="!isScheduleValid"
                                   class="dropdown"
                                   use-fixed-menu-style
                                   @select="onSelectStartHour"
                />
                <span class="text">{{ $t('IDENTITY.USER.NOTIFICATION.FORM.TO') }}</span>
                <p-select-dropdown v-model="proxySchedule.end_hour"
                                   :items="endTimeList"
                                   :invalid="!isScheduleValid"
                                   class="dropdown"
                                   use-fixed-menu-style
                                   @select="onSelectEndHour"
                />
                <span class="timezone-text">{{ $t('COMMON.PROFILE.TIMEZONE') }}: {{ timezone }}</span>
            </div>
        </article>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import {
    PRadio, PSelectButton, PSelectDropdown,
} from '@spaceone/design-system';
import InfoMessage from '@/common/components/guidance/InfoMessage.vue';
import { range } from 'lodash';
import { store } from '@/store';
import { timezoneToUtcFormatter } from '@/services/identity/user/lib/helper';

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
        isScheduled: {
            type: Boolean,
            default: false,
        },
        schedule: {
            type: Object,
            default: null,
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const timezoneForFormatter = computed(() => store.state.user.timezone).value;

        const checkInvalidByHour = (startHour: number, endHour: number) => {
            if (startHour === 0 && endHour === 0) return true;
            return startHour !== endHour;
        };

        const state = reactive({
            scheduleMode: computed(() => [{
                label: vm.$t('IDENTITY.USER.NOTIFICATION.FORM.ALL_TIME'), value: false,
            }, {
                label: vm.$t('IDENTITY.USER.NOTIFICATION.FORM.CUSTOM'), value: true,
            }]),
            proxyIsScheduled: props.isScheduled ? props.isScheduled : false,
            weekDay: [{ label: 'Monday', value: 'MON' }, { label: 'Tuesday', value: 'TUE' }, { label: 'Wednesday', value: 'WED' },
                { label: 'Thursday', value: 'THU' }, { label: 'Friday', value: 'FRI' },
                { label: 'Saturday', value: 'SAT' },
                { label: 'Sunday', value: 'SUN' }],
            startTimeList: START_TIME_LIST.map(d => ({
                type: 'item', label: `${d}:00`, name: timezoneToUtcFormatter(d, timezoneForFormatter),
            })),
            endTimeList: END_TIME_LIST.map(d => ({
                type: 'item', label: `${d}:00`, name: timezoneToUtcFormatter(d, timezoneForFormatter),
            })),
            proxySchedule: props.schedule ? props.schedule : {
                day_of_week: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
                start_hour: timezoneToUtcFormatter(9, timezoneForFormatter),
                end_hour: timezoneToUtcFormatter(18, timezoneForFormatter),
            },
            timezone: computed(() => store.state.user.timezone),
            // isScheduleValid: computed(() => (state.proxySchedule.start_hour !== state.proxySchedule.end_hour) || !state.proxyIsScheduled),
            isScheduleValid: computed(() => checkInvalidByHour(state.proxySchedule.start_hour, state.proxySchedule.end_hour) || !state.proxyIsScheduled),
        });

        const emitChange = () => {
            if (state.proxyIsScheduled) {
                emit('change', {
                    schedule: state.proxySchedule,
                    is_scheduled: state.proxyIsScheduled,
                    isScheduleValid: state.isScheduleValid,
                });
            } else {
                emit('change', {
                    schedule: {},
                    is_scheduled: state.proxyIsScheduled,
                    isScheduleValid: state.isScheduleValid,
                });
            }
        };

        const changeScheduleMode = (value) => {
            state.proxyIsScheduled = value;
            emitChange();
        };

        const onSelectDay = () => {
            emitChange();
        };

        const onSelectStartHour = (value) => {
            state.proxySchedule.start_hour = value;
            emitChange();
        };

        const onSelectEndHour = (value) => {
            state.proxySchedule.end_hour = value;
            emitChange();
        };


        return {
            ...toRefs(state),
            changeScheduleMode,
            onSelectDay,
            onSelectStartHour,
            onSelectEndHour,
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
