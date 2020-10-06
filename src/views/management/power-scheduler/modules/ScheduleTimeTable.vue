<template>
    <div class="schedule-time-table-container">
        <div class="title-lap">
            <span class="title">{{ $t('PWR_SCHED.TIME') }}</span>
            <span class="sub-title">{{ $t('PWR_SCHED.SCHED_TIME') }}</span>
        </div>
        <div class="button-lap">
            <p-button
                class="current-week-button"
                style-type="gray200"
                :outline="true"
                block
                @click="onClickCurrentWeek"
            >
                {{ $t('PWR_SCHED.THIS_WEEK') }}
            </p-button>
            <p-date-pagination :date.sync="currentDate" :allow-future="true" type="week"
                               :timezone="timezone"
            />
        </div>
        <div class="left">
            <div class="table-lap">
                <div class="time-section">
                    <div class="icon-item" />
                    <div v-for="time in range(0, 24)"
                         :key="time"
                         class="time"
                    >
                        {{ time % 2 !== 0 ? ('0' + time).slice(-2) : '' }}
                    </div>
                </div>
                <div class="data-section">
                    <div class="weekday-row">
                        <div
                            v-for="(weekday, index) in currentWeekList"
                            :key="index"
                            class="weekday-item"
                            :class="[weekday.format('YYYY-MM-DD') === today ? 'today' : '' ]"
                        >
                            <div class="weekday-text">
                                {{ weekdayTexts[weekday.day()] }}
                            </div>
                            <div class="weekday-number-text">
                                {{ weekday.format('D') }}
                            </div>
                        </div>
                    </div>
                    <div v-for="time in range(0, 24)"
                         :key="time"
                         class="item-row"
                    >
                        <div
                            v-for="week in currentWeekList"
                            :key="week.format('YYYY-MM-DD')"
                            :class="getClass(week.format('YYYY-MM-DD'), time)"
                            class="item"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div class="right">
            <div class="timezone-lap">
                <div class="title">
                    {{ $t('PWR_SCHED.TIMEZONE') }}
                </div>
                <div>{{ $t('PWR_SCHED.LOCAL_TIME') }}</div>
            </div>
            <div class="timer-lap">
                <div class="title">
                    {{ $t('PWR_SCHED.TIMER') }}
                </div>
                <div v-for="timer in timers" :key="timer.text"
                     class="legend-lap" :class="timer.class"
                >
                    <span class="legend-icon" />
                    <span>{{ timer.text }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { get, range } from 'lodash';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import {
    computed, reactive, toRefs, getCurrentInstance, ComponentRenderProxy, watch,
} from '@vue/composition-api';

import PDatePagination from '@/components/organisms/date-pagination/PDatePagination.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';

import { getTimezone } from '@/lib/util';
import { SpaceConnector } from '@/lib/space-connector';

dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);

interface RoutineRule {
    day: string;
    times: number[];
}
interface TicketRule {
    date: string;
    times: number[];
}
interface ScheduleRule {
    [key: string]: number[];
}

enum SCHEDULE_RULE_TYPE {
    routine = 'ROUTINE',
    ticket = 'TICKET',
}
enum RULE_STATE {
    running = 'RUNNING',
    stopped = 'STOPPED',
}

export default {
    name: 'ScheduleTimeTable',
    components: {
        PButton,
        PDatePagination,
    },
    props: {
        scheduleId: {
            type: String,
            required: true,
        },
        mode: {
            type: String,
            default: 'READ',
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            weekdayTexts: [
                vm.$t('PWR_SCHED.DAY_SUN'),
                vm.$t('PWR_SCHED.DAY_MON'),
                vm.$t('PWR_SCHED.DAY_TUE'),
                vm.$t('PWR_SCHED.DAY_WED'),
                vm.$t('PWR_SCHED.DAY_THU'),
                vm.$t('PWR_SCHED.DAY_FRI'),
                vm.$t('PWR_SCHED.DAY_SAT'),
            ],
            timers: [
                { class: 'routine', text: vm.$t('PWR_SCHED.TIMER_ROUTINE') },
                { class: 'ticket-running', text: vm.$t('PWR_SCHED.TIMER_RUNNING') },
                { class: 'ticket-stopped', text: vm.$t('PWR_SCHED.TIMER_STOPPED') },
            ],
            today: dayjs().tz(getTimezone()).format('YYYY-MM-DD'),
            currentDate: dayjs().tz(getTimezone()),
            timezone: getTimezone(),
            currentWeekList: computed(() => {
                let weekStart = state.currentDate.startOf('week');
                const weekEnd = state.currentDate.endOf('week');
                const weekList: Dayjs[] = [];
                while (weekStart.isSameOrBefore(weekEnd, 'day')) {
                    weekList.push(weekStart);
                    weekStart = weekStart.add(1, 'day');
                }
                return weekList;
            }),
            //
            scheduleRule: {
                routine: {} as ScheduleRule,
                ticketRunning: {} as ScheduleRule,
                ticketStopped: {} as ScheduleRule,
            },
        });

        const getClass = (date, time) => {
            // ticket running
            let rules = get(state.scheduleRule.ticketRunning, date);
            if (rules && rules.includes(time)) return 'ticket-running';

            rules = get(state.scheduleRule.ticketStopped, date);
            if (rules && rules.includes(time)) return 'ticket-stopped';

            // routine
            const weekdayName = dayjs(date).tz(getTimezone()).format('ddd').toLowerCase();
            rules = get(state.scheduleRule.routine, weekdayName);
            if (rules && rules.includes(time)) return 'routine';

            return '';
        };

        const getScheduleRuleWithTimezone = (scheduleRule) => {
            const rules: RoutineRule[] | TicketRule[] = scheduleRule.rule;
            const ruleType = scheduleRule.rule_type;
            const ruleState = scheduleRule.state;
            if (ruleType === SCHEDULE_RULE_TYPE.routine) {
                const newRule = {
                    sun: [],
                    mon: [],
                    tue: [],
                    wed: [],
                    thu: [],
                    fri: [],
                    sat: [],
                };
                const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
                const offsetHours = (dayjs().tz(getTimezone()).utcOffset()) / 60;
                rules.forEach((rule, index) => {
                    const weekday = rule.day;
                    rule.times.forEach((time) => {
                        let newTime = time + offsetHours;
                        if (newTime < 24) {
                            newRule[weekday].push(newTime);
                        } else {
                            newTime -= 24;
                            if (index === 6) {
                                console.log('sat');
                                newRule[weekdays[0]].push(newTime);
                            } else {
                                newRule[weekdays[index + 1]].push(newTime);
                            }
                        }
                    });
                });
                state.scheduleRule.routine = newRule;
            } else {
                const newRule = {};
                rules.forEach((rule) => {
                    const date = rule.date;
                    const times = rule.times;
                    times.forEach((time) => {
                        const utcDate = dayjs.utc(`${date} ${time}:00`);
                        const timezoneDate = utcDate.tz(getTimezone()).format('YYYY-MM-DD');
                        const timezoneHour = Number(utcDate.tz(getTimezone()).format('H'));
                        if (timezoneDate in newRule) {
                            newRule[timezoneDate].push(timezoneHour);
                        } else {
                            newRule[timezoneDate] = [timezoneHour];
                        }
                    });
                });
                if (ruleState === RULE_STATE.running) state.scheduleRule.ticketRunning = newRule;
                else if (ruleState === RULE_STATE.stopped) state.scheduleRule.ticketStopped = newRule;
            }
        };
        const getScheduleRule = async () => {
            const res = await SpaceConnector.client.powerScheduler.scheduleRule.list({
                // eslint-disable-next-line camelcase
                schedule_id: props.scheduleId,
            }, {
                headers: {
                    'Mock-Mode': 'true',
                },
            });
            res.results.forEach(result => getScheduleRuleWithTimezone(result));
        };
        const onClickCurrentWeek = () => {
            state.currentDate = dayjs().tz(getTimezone());
        };

        watch(() => props.scheduleId, async (after, before) => {
            if (after !== before) {
                await getScheduleRule();
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            getClass,
            onClickCurrentWeek,
            range,
        };
    },
};
</script>

<style lang="postcss">
.schedule-time-table-container {
    width: 100%;
    .title-lap {
        display: block;
        .title {
            @apply text-gray-900;
            font-size: 1rem;
            font-weight: bold;
            padding-right: 0.5rem;
        }
        .sub-title {
            @apply text-gray-400;
            font-size: 0.75rem;
        }
    }
    .button-lap {
        position: relative;
        width: 75%;
        padding-top: 1.5rem;
        padding-bottom: 0.5rem;
        .current-week-button {
            @apply text-gray-900;
            font-weight: normal;
        }
        .p-date-pagination {
            position: absolute;
            right: 0;
        }
    }
    .left {
        display: inline-block;
        width: 75%;
        .table-lap {
            display: flex;
            width: 100%;
            .time-section {
                @apply bg-primary4 border border-primary3 border-r-0;
                width: 3rem;
                .icon-item {
                    @apply border-b border-primary3;
                    height: 3.125rem;
                }
                .time {
                    @apply text-gray-500;
                    height: 0.75rem;
                    font-size: 0.625rem;
                    text-align: center;
                    line-height: 0.625rem;
                }
            }
            .data-section {
                @apply border border-primary3;
                width: calc(100% - 3rem);
                .weekday-row {
                    @apply bg-primary4 border-b border-primary3;
                    width: 100%;
                    height: 3.125rem;
                    .weekday-item {
                        @apply text-gray-500;
                        display: inline-block;
                        width: calc(100% / 7);
                        font-size: 0.75rem;
                        text-align: center;
                        padding: 0.625rem;
                        .weekday-text {
                            font-weight: bold;
                        }
                        &.today {
                            @apply text-gray-900;
                            font-weight: bold;
                        }
                    }
                }
                .item-row {
                    @apply border-b border-primary4;
                    display: flex;
                    width: 100%;
                    height: 0.75rem;
                    &:last-child {
                        border-bottom: none;
                    }
                    .item {
                        @apply border-l border-primary4;
                        display: inline-flex;
                        width: calc(100% / 7);
                        height: 0.75rem;
                        margin: 0;
                        &:first-child {
                            @apply border-l-0;
                        }
                        &.routine {
                            @apply bg-point-violet;
                            height: 0.7rem;
                            border-radius: 0.125rem;
                        }
                        &.ticket-running {
                            @apply bg-peacock-300;
                            height: 0.7rem;
                            border-radius: 0.125rem;
                        }
                        &.ticket-stopped {
                            @apply bg-red-400;
                            height: 0.7rem;
                            border-radius: 0.125rem;
                        }
                    }
                }
            }
        }
    }
    .right {
        display: inline-block;
        width: 25%;
        vertical-align: top;
        font-size: 0.875rem;
        padding: 0 3.5rem;
        .title {
            @apply text-gray-400;
            font-weight: bold;
            padding-bottom: 0.5rem;
        }
        .timezone-lap {
            @apply text-gray-900;
            padding-bottom: 3rem;
        }
        .legend-lap {
            padding-bottom: 0.5rem;
            &.routine {
                @apply text-point-violet;
                .legend-icon {
                    @apply bg-point-violet;
                }
            }
            &.ticket-running {
                @apply text-peacock-300;
                .legend-icon {
                    @apply bg-peacock-300;
                }
            }
            &.ticket-stopped {
                @apply text-red-500;
                .legend-icon {
                    @apply bg-red-400;
                }
            }
            .legend-icon {
                display: inline-block;
                width: 0.75rem;
                height: 0.75rem;
                vertical-align: baseline;
                border-radius: 2px;
                margin-right: 0.5rem;
            }
        }
    }
}
</style>
