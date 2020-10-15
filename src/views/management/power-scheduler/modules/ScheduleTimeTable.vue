<template>
    <div class="schedule-time-table-container">
        <div class="title-lap">
            <span class="title">{{ $t('PWR_SCHED.TIME') }}</span>
            <span class="sub-title">{{ $t('PWR_SCHED.SCHED_TIME') }}</span>
        </div>
        <div class="button-lap">
            <p-button class="gray900 this-week-button" block
                      :outline="true"
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
                <div ref="draggableSection" class="data-section">
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
                    <vue-selecto
                        v-if="editMode"
                        :drag-container="dragContainer"
                        :selectable-targets="['.item']"
                        :hit-rate="1"
                        :select-by-click="true"
                        :select-from-inside="true"
                        :continue-select="true"
                        :toggle-continue-select="'shift'"
                        @select="onDragSelect"
                    />
                    <div v-for="time in range(0, 24)"
                         :key="time"
                         class="item-row"
                    >
                        <div
                            v-for="week in currentWeekList"
                            :key="week.format('YYYY-MM-DD')"
                            ref="item"
                            :class="[week.format('YYYY-MM-DD'), `${week.format('ddd')}-${time}`]"
                            class="item"
                        />
                    </div>
                    <div v-if="showHelpBlock" class="help-block">
                        <p class="help-text">
                            날짜와 시간을 클릭/드래그하여 타이머를 적용하세요.<br>재 클릭시 해제할 수 있습니다.
                        </p>
                        <p-i name="cursor_pointer--blue" class="cursor-icon"
                             width="2rem" height="2rem"
                             color="white inherit"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div class="right">
            <div class="content-lap" :class="editMode ? 'opacity-25' : ''">
                <div class="title">
                    {{ $t('PWR_SCHED.TIMEZONE') }}
                </div>
                <div>{{ $t('PWR_SCHED.LOCAL_TIME') }}</div>
            </div>
            <!--routine-->
            <div class="content-lap" :class="oneTimeEditMode ? 'opacity-25' : ''">
                <div class="title">
                    {{ $t('PWR_SCHED.SCHED_ROUTINE') }}
                </div>
                <div class="legend-lap routine">
                    <span class="legend-icon" />
                    <span>{{ $t('PWR_SCHED.ROUTINE_TIMER') }}</span>
                    <p-button v-if="mode !== 'READ'"
                              class="gray900 sm" :outline="true"
                              @click="onDeleteAllRoutine"
                    >
                        {{ $t('PWR_SCHED.DELETE_ALL') }}
                    </p-button>
                </div>
            </div>
            <!--one time ticket-->
            <div class="content-lap" :class="mode !== 'READ' ? 'opacity-25' : ''">
                <div class="title" :class="oneTimeEditMode ? 'activated' : ''">
                    {{ $t('PWR_SCHED.SCHED_ONE_TIME') }}
                    <p-button v-if="oneTimeEditMode"
                              class="gray900 sm ml-4 mr-1" :outline="true"
                              @click="onClickSaveOneTimeSchedule"
                    >
                        {{ $t('PWR_SCHED.SAVE') }}
                    </p-button>
                    <p-button v-if="oneTimeEditMode"
                              class="gray900 sm" :outline="true"
                              @click="onClickCancelOneTimeSchedule"
                    >
                        {{ $t('PWR_SCHED.CANCEL') }}
                    </p-button>
                </div>
                <div class="legend-lap one-time-run pb-2">
                    <span class="legend-icon" />
                    <span>{{ $t('PWR_SCHED.RUN_SCHED') }}</span>
                    <p-button v-if="!editMode"
                              class="gray900 sm" :outline="true"
                              @click="onClickStartOneTimeEditMode('RUN')"
                    >
                        {{ $t('PWR_SCHED.EDIT') }}
                    </p-button>
                    <span v-if="oneTimeEditMode === 'RUN'" class="making-ticket-text">
                        {{ $t('PWR_SCHED.MAKING_TICKET') }}
                    </span>
                </div>
                <div class="legend-lap one-time-stop">
                    <span class="legend-icon" />
                    <span>{{ $t('PWR_SCHED.STOP_SCHED') }}</span>
                    <p-button v-if="!editMode"
                              class="gray900 sm" :outline="true"
                              @click="onClickStartOneTimeEditMode('STOP')"
                    >
                        {{ $t('PWR_SCHED.EDIT') }}
                    </p-button>
                    <span v-if="oneTimeEditMode === 'STOP'" class="making-ticket-text">
                        {{ $t('PWR_SCHED.MAKING_TICKET') }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { get, range } from 'lodash';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { VueSelecto } from 'vue-selecto';

import {
    computed, reactive, toRefs, getCurrentInstance, ComponentRenderProxy, watch, onMounted,
} from '@vue/composition-api';

import PDatePagination from '@/components/organisms/date-pagination/PDatePagination.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PI from '@/components/atoms/icons/PI.vue';

import { getTimezone } from '@/lib/util';
import { SpaceConnector } from '@/lib/space-connector';
import { ViewMode } from '@/views/management/power-scheduler/type';

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

    interface Props {
        scheduleId?: string;
        mode: ViewMode;
    }

export default {
    name: 'ScheduleTimeTable',
    components: {
        PI,
        PButton,
        PDatePagination,
        VueSelecto,
    },
    props: {
        scheduleId: {
            type: String,
            default: undefined,
        },
        mode: {
            type: String,
            default: 'READ',
        },
    },
    setup(props: Props, { refs }) {
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
            timezone: getTimezone(),
            today: dayjs().tz(getTimezone()).format('YYYY-MM-DD'),
            currentDate: dayjs().tz(getTimezone()),
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
            // schedule
            editMode: computed(() => props.mode !== 'READ' || state.oneTimeEditMode),
            oneTimeEditMode: false as boolean | string,
            dragContainer: undefined,
            scheduleRule: {
                routine: {
                    sun: [],
                    mon: [],
                    tue: [],
                    wed: [],
                    thu: [],
                    fri: [],
                    sat: [],
                } as ScheduleRule,
                oneTimeRun: {} as ScheduleRule,
                oneTimeStop: {} as ScheduleRule,
            },
            showHelpBlock: computed(() => {
                if (!state.editMode) return false;
                return !state.isRoutineDataExists && !state.isOneTimeRunDataExists && !state.isOneTimeStopDataExists;
            }),
            // check api data
            isRoutineDataExists: false,
            isOneTimeRunDataExists: false,
            isOneTimeStopDataExists: false,
        });

        // api
        const setStyleClass = () => {
            refs.item.forEach((item) => {
                const classes = item.classList;
                const date = classes[1];
                const weekday = classes[2].split('-')[0].toLowerCase();
                const time = Number(classes[2].split('-')[1]);

                // init
                item.classList.remove('routine', 'one-time-run', 'one-time-stop', 'opacity-25');

                // routine
                let rules = get(state.scheduleRule.routine, weekday);
                if (rules && rules.includes(time)) {
                    item.classList.add('routine');
                    if (state.oneTimeEditMode) item.classList.add('opacity-25');
                }

                // one time
                if (props.mode === 'READ') {
                    // run
                    if (state.oneTimeEditMode !== 'STOP') {
                        rules = get(state.scheduleRule.oneTimeRun, date);
                        if (rules && rules.includes(time)) {
                            item.classList.add('one-time-run');
                        }
                    }

                    // stop
                    if (state.oneTimeEditMode !== 'RUN') {
                        rules = get(state.scheduleRule.oneTimeStop, date);
                        if (rules && rules.includes(time)) {
                            item.classList.add('one-time-stop');
                            item.classList.remove('opacity-25');
                        }
                    }
                }
            });
        };
        const getScheduleRuleWithTimezone = (scheduleRule) => {
            const rules: RoutineRule[] | TicketRule[] = scheduleRule.rule;
            const ruleType = scheduleRule.rule_type;
            const ruleState = scheduleRule.state;
            if (ruleType === SCHEDULE_RULE_TYPE.routine) {
                const newRule = state.scheduleRule.routine;
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
                                newRule[weekdays[0]].push(newTime);
                            } else {
                                newRule[weekdays[index + 1]].push(newTime);
                            }
                        }
                    });
                });
                state.scheduleRule.routine = newRule;
                state.isRoutineDataExists = true;
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
                if (ruleState === RULE_STATE.running) {
                    state.scheduleRule.oneTimeRun = newRule;
                    state.isOneTimeRunDataExists = true;
                } else if (ruleState === RULE_STATE.stopped) {
                    state.scheduleRule.oneTimeStop = newRule;
                    state.isOneTimeStopDataExists = true;
                }
            }
        };
        const getScheduleRule = async () => {
            const res = await SpaceConnector.client.powerScheduler.scheduleRule.list({
                schedule_id: props.scheduleId,
            });
            res.results.forEach(result => getScheduleRuleWithTimezone(result));
        };
        const createSchedule = async () => {
            const res = await SpaceConnector.client.powerScheduler.schedule.create({
                // schedule_id: props.scheduleId,
                // 'project_id':
            });
        };
        const createOrUpdateScheduleRule = async () => {
            if (!props.scheduleId) await createSchedule();
            // const res = await SpaceConnector.client.powerScheduler.
        };

        // events
        const onClickCurrentWeek = () => {
            state.currentDate = dayjs().tz(getTimezone());
        };
        const onDragSelect = (e) => {
            const setClass = (el) => {
                const classList = el.classList;
                const date = classList[1];
                const week = classList[2].split('-')[0].toLowerCase();
                const time = Number(classList[2].split('-')[1]);

                const routineTimes = get(state.scheduleRule.routine, week);
                let oneTimeTimes = [] as number[];

                if (props.mode !== 'READ') { // toggle routine rule
                    if (routineTimes && routineTimes.includes(time)) {
                        const idx = routineTimes.indexOf(time);
                        state.scheduleRule.routine[week].splice(idx, 1);
                        classList.remove('routine');
                    } else {
                        state.scheduleRule.routine[week].push(time);
                        classList.add('routine');
                    }
                } else { // one time
                    // prevent adding run(stop) tickets when the rule is (not) routine
                    const isRoutineTime = routineTimes.includes(time);
                    if (state.oneTimeEditMode === 'RUN' && isRoutineTime) return;
                    if (state.oneTimeEditMode === 'STOP' && !isRoutineTime) return;

                    let editMode;
                    let className;
                    if (state.oneTimeEditMode === 'RUN') {
                        editMode = 'oneTimeRun';
                        className = 'one-time-run';
                    } else {
                        editMode = 'oneTimeStop';
                        className = 'one-time-stop';
                    }

                    // toggle one time rule
                    oneTimeTimes = get(state.scheduleRule[editMode], date);
                    if (oneTimeTimes && oneTimeTimes.includes(time)) {
                        const idx = oneTimeTimes.indexOf(time);
                        state.scheduleRule[editMode][date].splice(idx, 1);
                        classList.remove(className);
                    } else {
                        if (state.scheduleRule[editMode][date]) state.scheduleRule[editMode][date].push(time);
                        else state.scheduleRule[editMode][date] = [time];
                        classList.add(className);
                    }
                }
            };
            e.added.forEach((el) => {
                setClass(el);
            });
            e.removed.forEach((el) => {
                setClass(el);
            });
            setStyleClass();
        };
        const onDeleteAllRoutine = () => {
            state.scheduleRule.routine = {
                sun: [],
                mon: [],
                tue: [],
                wed: [],
                thu: [],
                fri: [],
                sat: [],
            };
            setStyleClass();
        };
        const onClickStartOneTimeEditMode = (type) => {
            state.oneTimeEditMode = type;
            setStyleClass();
        };
        const onClickSaveOneTimeSchedule = () => {
            // save logic
        };
        const onClickCancelOneTimeSchedule = async () => {
            state.oneTimeEditMode = false;
            await getScheduleRule();
            setStyleClass();
        };

        //
        const create = async () => {
            //
        };
        const update = async () => {
            //
        };

        watch(() => props.scheduleId, async (after, before) => {
            if (after !== before) {
                await getScheduleRule();
                setStyleClass();
            }
        }, { immediate: true });
        watch(() => props.mode, async (after) => {
            if (after !== 'READ') {
                state.oneTimeEditMode = false;
                await getScheduleRule();
                setStyleClass();
            }
        }, { immediate: true });
        watch(() => state.currentDate, () => {
            setStyleClass();
        });

        onMounted(() => {
            state.dragContainer = refs.draggableSection;
        });

        return {
            ...toRefs(state),
            onClickCurrentWeek,
            onDragSelect,
            onDeleteAllRoutine,
            onClickStartOneTimeEditMode,
            onClickSaveOneTimeSchedule,
            onClickCancelOneTimeSchedule,
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
            .this-week-button {
                @apply border-gray-300;
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
                    position: relative;
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
                            &.selected {
                                @apply border border-gray-900 border-dashed;
                            }
                            &.routine {
                                @apply bg-point-violet;
                                height: 0.7rem;
                                border-radius: 0.125rem;
                            }
                            &.one-time-run {
                                @apply bg-peacock-300;
                                height: 0.7rem;
                                border-radius: 0.125rem;
                            }
                            &.one-time-stop {
                                @apply bg-red-400;
                                height: 0.7rem;
                                border-radius: 0.125rem;
                            }
                        }
                    }
                    .help-block {
                        @apply border-dashed border-secondary text-secondary;
                        position: absolute;
                        display: table;
                        width: calc(100% / 7 * 3);
                        height: 3.75rem;
                        top: 9rem;
                        left: calc(100% / 7 * 2);
                        border-width: 2px;
                        border-radius: 2px;
                        opacity: 0.75;
                        .help-text {
                            display: table-cell;
                            height: 100%;
                            vertical-align: middle;
                            font-size: 0.75rem;
                            line-height: 120%;
                            text-align: center;
                        }
                        .cursor-icon {
                            position: absolute;
                            bottom: -1.4rem;
                            right: -0.9rem;
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
            padding-left: 3.5rem;
            .content-lap {
                padding-bottom: 2rem;
            }
            .title {
                @apply text-gray-400;
                font-weight: bold;
                line-height: 1.5rem;
                padding-bottom: 0.5rem;
                &.activated {
                    @apply text-secondary;
                }
            }
            .legend-lap {
                line-height: 1.25rem;
                &.routine {
                    @apply text-point-violet;
                    .legend-icon {
                        @apply bg-point-violet;
                    }
                }
                &.one-time-run {
                    @apply text-peacock-300;
                    .legend-icon {
                        @apply bg-peacock-300;
                    }
                }
                &.one-time-stop {
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
                .making-ticket-text {
                    @apply bg-blue-200 text-secondary;
                    font-size: 0.75rem;
                    margin-left: 1rem;
                    padding-left: 0.5rem;
                    padding-right: 0.5rem;
                }
                .p-button {
                    @apply border-gray-300;
                    height: 1.25rem;
                    margin-left: 1rem;
                }
            }
        }
    }
</style>
