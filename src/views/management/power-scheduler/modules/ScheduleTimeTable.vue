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
                        :hit-rate="5"
                        :select-by-click="false"
                        :select-from-inside="false"
                        :continue-select="true"
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
                            @click="onClickTimeBlock"
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
import { get, range, isEmpty } from 'lodash';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { VueSelecto } from 'vue-selecto';

import {
    computed, reactive, toRefs, getCurrentInstance, ComponentRenderProxy, watch, onMounted,
} from '@vue/composition-api';

import { ViewMode } from '@/views/management/power-scheduler/type';
import PDatePagination from '@/components/organisms/date-pagination/PDatePagination.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PI from '@/components/atoms/icons/PI.vue';

import { getTimezone } from '@/lib/util';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { store } from '@/store';

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
interface Rule {
    [key: string]: number[];
}

enum RULE_TYPE {
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
            rule: {
                routine: {} as Rule,
                oneTimeRun: {} as Rule,
                oneTimeStop: {} as Rule,
            },
            showHelpBlock: computed(() => {
                if (!state.editMode) return false;
                return false;
            }),
        });

        // util
        const setStyleClass = () => {
            refs.item.forEach((item) => {
                const classes = item.classList;
                const date = classes[1];
                const weekday = classes[2].split('-')[0].toLowerCase();
                const time = Number(classes[2].split('-')[1]);

                // init
                item.classList.remove('routine', 'one-time-run', 'one-time-stop', 'opacity-25');

                // routine
                let rules = get(state.rule.routine, weekday);
                if (rules && rules.includes(time)) {
                    if (!item.classList.contains('routine')) item.classList.add('routine');
                    if (state.oneTimeEditMode) item.classList.add('opacity-25');
                }

                // one time
                if (props.mode === 'READ') {
                    // run
                    if (state.oneTimeEditMode !== 'STOP') {
                        rules = get(state.rule.oneTimeRun, date);
                        if (rules && rules.includes(time)) {
                            if (!item.classList.contains('one-time-run')) item.classList.add('one-time-run');
                        }
                    }

                    // stop
                    if (state.oneTimeEditMode !== 'RUN') {
                        rules = get(state.rule.oneTimeStop, date);
                        if (rules && rules.includes(time)) {
                            if (!item.classList.contains('one-time-stop')) item.classList.add('one-time-stop');
                            item.classList.remove('opacity-25');
                        }
                    }
                }
            });
        };
        const changeTimezoneToUTC = (rule: Rule, ruleType) => {
            if (state.timezone === 'UTC') return rule;

            // routine
            if (ruleType === RULE_TYPE.routine) {
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
                Object.entries(rule).forEach(([weekday, times]) => {
                    times.forEach((time) => {
                        let newTime = time - offsetHours;
                        if (newTime > 0) {
                            newRule[weekday].push(newTime);
                        } else {
                            newTime += 24;
                            const weekIdx = weekdays.indexOf(weekday);
                            if (weekIdx === 0) {
                                newRule[weekdays[6]].push(newTime);
                            } else {
                                newRule[weekdays[weekIdx - 1]].push(newTime);
                            }
                        }
                    });
                });
                return newRule;
            }

            // one time
            const newRule = {};
            Object.entries(rule).forEach(([date, times]) => {
                times.forEach((time) => {
                    const utcRawDate = dayjs(`${date} ${time}:00`).utc();
                    const utcDate = utcRawDate.format('YYYY-MM-DD');
                    const utcHour = Number(utcRawDate.format('H'));
                    if (utcDate in newRule) {
                        newRule[utcDate].push(utcHour);
                    } else {
                        newRule[utcDate] = [utcHour];
                    }
                });
            });
            return newRule;
        };
        const changeTimezoneToLocal = (rule: Rule, ruleType) => {
            // routine
            if (ruleType === RULE_TYPE.routine) {
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
                Object.entries(rule).forEach(([weekday, times]) => {
                    times.forEach((time) => {
                        let newTime = time + offsetHours;
                        if (newTime < 24) {
                            newRule[weekday].push(newTime);
                        } else {
                            newTime -= 24;
                            const weekIdx = weekdays.indexOf(weekday);
                            if (weekIdx === 6) {
                                newRule[weekdays[0]].push(newTime);
                            } else {
                                newRule[weekdays[weekIdx + 1]].push(newTime);
                            }
                        }
                    });
                });
                return newRule;
            }

            // one time
            const newRule = {};
            Object.entries(rule).forEach(([date, times]) => {
                times.forEach((time) => {
                    const utcDate = dayjs.utc(`${date} ${time}:00`);
                    const localDate = utcDate.tz(getTimezone()).format('YYYY-MM-DD');
                    const localHour = Number(utcDate.tz(getTimezone()).format('H'));
                    if (localDate in newRule) {
                        newRule[localDate].push(localHour);
                    } else {
                        newRule[localDate] = [localHour];
                    }
                });
            });
            return newRule;
        };

        // api
        const getScheduleRule = async () => {
            // init schedule Rule state
            state.rule.routine = {};
            state.rule.oneTimeRun = {};
            state.rule.oneTimeStop = {};

            if (!props.scheduleId) return;

            const res = await SpaceConnector.client.powerScheduler.scheduleRule.list({
                schedule_id: props.scheduleId,
            });
            res.results.forEach((scheduleRule) => {
                const rule: Rule = {};
                if (scheduleRule.rule_type === RULE_TYPE.routine) {
                    scheduleRule.rule.forEach((r) => {
                        rule[r.day] = r.times;
                    });
                    state.rule.routine = changeTimezoneToLocal(rule, scheduleRule.rule_type);
                } else {
                    scheduleRule.rule.forEach((r) => {
                        rule[r.date] = r.times;
                    });
                    if (scheduleRule.state === RULE_STATE.running) {
                        state.rule.oneTimeRun = changeTimezoneToLocal(rule, scheduleRule.rule_type);
                    } else if (scheduleRule.state === RULE_STATE.stopped) {
                        state.rule.oneTimeStop = changeTimezoneToLocal(rule, scheduleRule.rule_type);
                    }
                }
            });
        };
        const createOrUpdate = async (scheduleId) => {
            let ruleType = '';
            let ruleState = '';
            let ruleWithUTC: Rule = {};
            const ruleForApi: RoutineRule[] | TicketRule[] = [];

            if (props.mode !== 'READ') {
                ruleType = RULE_TYPE.routine;
                ruleState = RULE_STATE.running;
                ruleWithUTC = changeTimezoneToUTC(state.rule.routine, RULE_TYPE.routine);
                Object.entries(ruleWithUTC).forEach(([k, v]) => {
                    if (v.length > 0) {
                        ruleForApi.push({ day: k, times: v, date: '' });
                    }
                });
            } else if (state.oneTimeEditMode) {
                ruleType = RULE_TYPE.ticket;
                if (state.oneTimeEditMode === 'RUN') {
                    ruleState = RULE_STATE.running;
                    ruleWithUTC = changeTimezoneToUTC(state.rule.oneTimeRun, RULE_TYPE.ticket);
                } else if (state.oneTimeEditMode === 'STOP') {
                    ruleState = RULE_STATE.stopped;
                    ruleWithUTC = changeTimezoneToUTC(state.rule.oneTimeStop, RULE_TYPE.ticket);
                }
                Object.entries(ruleWithUTC).forEach(([k, v]) => {
                    if (v.length > 0) {
                        ruleForApi.push({ date: k, times: v, day: '' });
                    }
                });
            } else {
                return;
            }

            // check scheduleRule exists
            let scheduleRuleId = '';
            const query = new QueryHelper().setFilter(
                {
                    k: 'rule_type',
                    v: ruleType,
                    o: 'eq',
                },
                {
                    k: 'state',
                    v: ruleState,
                    o: 'eq',
                },
            );
            const res = await SpaceConnector.client.powerScheduler.scheduleRule.list({
                schedule_id: scheduleId,
                query: query.data,
            });

            // create or update schedule rule
            if (res.results.length > 0) {
                scheduleRuleId = res.results[0].schedule_rule_id;

                // update or delete
                if (ruleForApi.length === 0) {
                    await SpaceConnector.client.powerScheduler.scheduleRule.delete({
                        schedule_rule_id: scheduleRuleId,
                    });
                } else {
                    await SpaceConnector.client.powerScheduler.scheduleRule.update({
                        schedule_rule_id: scheduleRuleId,
                        rule: ruleForApi,
                    });
                }
            } else {
                if (ruleForApi.length === 0) return;
                await SpaceConnector.client.powerScheduler.scheduleRule.create({
                    user_id: store.state.user.userId,
                    schedule_id: scheduleId,
                    rule_type: ruleType,
                    name: `${ruleType} - ${ruleState}`,
                    state: ruleState,
                    rule: ruleForApi,
                });
            }
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

                const routineTimes = get(state.rule.routine, week);

                if (props.mode !== 'READ') {
                    if (routineTimes && routineTimes.includes(time)) return;
                    if (state.rule.routine[week]) state.rule.routine[week].push(time);
                    else state.rule.routine[week] = [time];
                } else {
                    // prevent adding run(stop) tickets when the rule is (not) routine
                    const isRoutineTime = routineTimes && routineTimes.includes(time);
                    if (state.oneTimeEditMode === 'RUN') {
                        const oneTimeTimes = get(state.rule.oneTimeRun, date);
                        if (isRoutineTime) return;
                        if (oneTimeTimes && oneTimeTimes.includes(time)) return;
                        if (state.rule.oneTimeRun[date]) state.rule.oneTimeRun[date].push(time);
                        else state.rule.oneTimeRun[date] = [time];
                    } else if (state.oneTimeEditMode === 'STOP') {
                        const oneTimeTimes = get(state.rule.oneTimeStop, date);
                        if (!isRoutineTime) return;
                        if (oneTimeTimes && oneTimeTimes.includes(time)) return;
                        if (state.rule.oneTimeStop[date]) state.rule.oneTimeStop[date].push(time);
                        else state.rule.oneTimeStop[date] = [time];
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
        const onClickTimeBlock = (e) => {
            if (!state.editMode) return;

            const classList = e.target.classList;
            const date = classList[1];
            const week = classList[2].split('-')[0].toLowerCase();
            const time = Number(classList[2].split('-')[1]);

            const routineTimes = get(state.rule.routine, week);
            const isRoutineTime = routineTimes && routineTimes.includes(time);

            if (props.mode !== 'READ') {
                if (routineTimes && routineTimes.includes(time)) { // already exists
                    const idx = routineTimes.indexOf(time);
                    state.rule.routine[week].splice(idx, 1);
                } else if (state.rule.routine[week]) {
                    state.rule.routine[week].push(time);
                } else {
                    state.rule.routine[week] = [time];
                }
            } else {
                if (state.oneTimeEditMode === 'RUN' && isRoutineTime) return;
                if (state.oneTimeEditMode === 'STOP' && !isRoutineTime) return;

                let editMode: string;
                if (state.oneTimeEditMode === 'RUN') editMode = 'oneTimeRun';
                else editMode = 'oneTimeStop';

                const oneTimeTimes = get(state.rule[editMode], date);
                if (oneTimeTimes && oneTimeTimes.includes(time)) { // already exists
                    const idx = oneTimeTimes.indexOf(time);
                    state.rule[editMode][date].splice(idx, 1);
                } else if (state.rule[editMode][date]) {
                    state.rule[editMode][date].push(time);
                } else {
                    state.rule[editMode][date] = [time];
                }
            }

            setStyleClass();
        };
        const onDeleteAllRoutine = () => {
            state.rule.routine = {
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
        const onClickSaveOneTimeSchedule = async () => {
            await createOrUpdate(props.scheduleId);
            await getScheduleRule();

            state.oneTimeEditMode = false;
            setStyleClass();
        };
        const onClickCancelOneTimeSchedule = async () => {
            state.oneTimeEditMode = false;
            await getScheduleRule();
            setStyleClass();
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
            onClickTimeBlock,
            range,
            createOrUpdate,
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
