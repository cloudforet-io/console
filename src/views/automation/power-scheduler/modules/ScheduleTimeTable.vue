<template>
    <div class="schedule-time-table-container">
        <div class="title-lap">
            <span class="title">{{ $t('PWR_SCHED.TIME') }}</span>
            <span class="sub-title">{{ $t('PWR_SCHED.SCHED_TIME') }}</span>
            <div class="button-lap">
                <p-date-pagination :date.sync="currentDate" :allow-future="true" type="week"
                                   :timezone="timezone"
                />
                <p-button class="gray900 this-week-button" block
                          :outline="true"
                          @click="onClickCurrentWeek"
                >
                    {{ $t('PWR_SCHED.THIS_WEEK') }}
                </p-button>
            </div>
        </div>
        <div class="content-lap">
            <div class="left-lap">
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
                        :select-by-click="false"
                        :select-from-inside="false"
                        :continue-select="false"
                        @select="onSelectStart"
                        @selectEnd="onSelectEnd"
                    />
                    <transition name="fade-in">
                        <div v-if="loading" class="loader w-full h-full">
                            <slot name="loader" :loading="loading">
                                <p-lottie name="thin-spinner"
                                          auto
                                          :size="1.5"
                                />
                            </slot>
                        </div>
                    </transition>
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
            <div class="right-lap">
                <!--timezone-->
                <div class="pb-8" :class="editMode ? 'opacity-25' : ''">
                    <div class="title pt-0">
                        {{ $t('PWR_SCHED.TIMEZONE') }}
                    </div>
                    <div>{{ $t('PWR_SCHED.LOCAL_TIME') }}</div>
                    <!--                <div class="content">-->
                    <!--                    <div v-if="mode === 'READ'">-->
                    <!--                        {{ timezone }}-->
                    <!--                    </div>-->
                    <!--                    <div v-else>-->
                    <!--                        <p-select-dropdown v-model="timezone"-->
                    <!--                                           :items="timezones"-->
                    <!--                                           auto-height-->
                    <!--                        />-->
                    <!--                    </div>-->
                    <!--                </div>-->
                </div>
                <!--routine-->
                <div class="pb-8" :class="oneTimeEditMode ? 'opacity-25' : ''">
                    <div class="title">
                        {{ $t('PWR_SCHED.SCHED_ROUTINE') }}
                    </div>
                    <div class="legend-lap routine">
                        <span class="legend-icon" />
                        <span>{{ $t('PWR_SCHED.ROUTINE_TIMER') }}</span>
                        <div>
                            <p-button v-if="mode !== 'READ'"
                                      class="gray900 sm" :outline="true"
                                      @click="onDeleteAllRoutine"
                            >
                                {{ $t('PWR_SCHED.DELETE_ALL') }}
                            </p-button>
                        </div>
                    </div>
                </div>
                <!--one time ticket-->
                <div :class="[mode !== 'READ' ? 'opacity-25' : '', oneTimeEditMode ? 'activated' : '']">
                    <div class="title" :class="oneTimeEditMode ? 'activated' : ''">
                        {{ $t('PWR_SCHED.SCHED_ONE_TIME') }}
                    </div>
                    <div class="legend-lap one-time-run pb-2" :class="oneTimeEditMode === 'STOP' ? 'opacity-25' : ''">
                        <span class="legend-icon" />
                        <span>{{ $t('PWR_SCHED.RUN_SCHED') }}</span>
                        <p-button v-if="!editMode"
                                  class="edit-button gray900 sm" :outline="true"
                                  @click="onClickStartOneTimeEditMode('RUN')"
                        >
                            {{ $t('PWR_SCHED.EDIT') }}
                        </p-button>
                        <span v-if="oneTimeEditMode === 'RUN'" class="making-ticket-text">
                            {{ $t('PWR_SCHED.MAKING_TICKET') }}
                        </span>
                    </div>
                    <div class="legend-lap one-time-stop" :class="oneTimeEditMode === 'RUN' ? 'opacity-25' : ''">
                        <span class="legend-icon" />
                        <span>{{ $t('PWR_SCHED.STOP_SCHED') }}</span>
                        <p-button v-if="!editMode"
                                  class="edit-button gray900 sm" :outline="true"
                                  @click="onClickStartOneTimeEditMode('STOP')"
                        >
                            {{ $t('PWR_SCHED.EDIT') }}
                        </p-button>
                        <span v-if="oneTimeEditMode === 'STOP'" class="making-ticket-text">
                            {{ $t('PWR_SCHED.MAKING_TICKET') }}
                        </span>
                    </div>
                </div>
                <!--buttons-->
                <div class="one-time-button-lap">
                    <p-button v-if="oneTimeEditMode"
                              class="gray900 sm mr-1" :outline="true"
                              @click="onClickCancelOneTimeSchedule"
                    >
                        {{ $t('PWR_SCHED.CANCEL') }}
                    </p-button>
                    <p-button v-if="oneTimeEditMode"
                              class="secondary sm"
                              @click="onClickSaveOneTimeSchedule"
                    >
                        {{ $t('PWR_SCHED.SAVE') }}
                    </p-button>
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

import { ViewMode } from '@/views/automation/power-scheduler/type';
import PDatePagination from '@/components/organisms/date-pagination/PDatePagination.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PI from '@/components/atoms/icons/PI.vue';

import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { store } from '@/store';

dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);

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

interface RuleSettings {
    ruleType: RULE_TYPE;
    ruleState: RULE_STATE;
    ruleWithUTC: Rule;
    ruleForApi: object[];
}

interface Props {
    scheduleId?: string;
    mode: ViewMode;
}

export default {
    name: 'ScheduleTimeTable',
    components: {
        PLottie,
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
            loading: false,
            weekdayTexts: [
                vm.$t('PWR_SCHED.DAY_SUN'),
                vm.$t('PWR_SCHED.DAY_MON'),
                vm.$t('PWR_SCHED.DAY_TUE'),
                vm.$t('PWR_SCHED.DAY_WED'),
                vm.$t('PWR_SCHED.DAY_THU'),
                vm.$t('PWR_SCHED.DAY_FRI'),
                vm.$t('PWR_SCHED.DAY_SAT'),
            ],
            timezones: [
                { type: 'item', label: 'UTC (default)', name: 'UTC' },
                { type: 'item', label: 'Asia/Seoul', name: 'Asia/Seoul' },
            ],
            timezone: computed(() => store.state.user.timezone),
            today: computed(() => dayjs().tz(state.timezone).format('YYYY-MM-DD')),
            currentDate: dayjs(),
            currentWeekList: computed(() => {
                let weekStart = state.currentDate.tz(state.timezone).startOf('week');
                const weekEnd = state.currentDate.tz(state.timezone).endOf('week');
                const weekList: Dayjs[] = [];
                while (weekStart.isSameOrBefore(weekEnd, 'day')) {
                    weekList.push(weekStart);
                    weekStart = weekStart.add(1, 'day');
                }
                return weekList;
            }),
            // schedule
            editMode: computed(() => props.mode !== 'READ' || state.oneTimeEditMode),
            editModeClassName: computed(() => {
                if (props.mode !== 'READ') return 'routine';
                if (state.oneTimeEditMode === 'RUN') return 'one-time-run';
                if (state.oneTimeEditMode === 'STOP') return 'one-time-stop';
                return '';
            }),
            oneTimeEditMode: false as boolean | string,
            dragContainer: undefined,
            rule: {
                routine: {} as Rule,
                oneTimeRun: {} as Rule,
                oneTimeStop: {} as Rule,
            },
            showHelpBlock: false,
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
                const offsetHours = (dayjs().tz(state.timezone).utcOffset()) / 60;
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
                const offsetHours = (dayjs().tz(state.timezone).utcOffset()) / 60;
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
                    const localDate = utcDate.tz(state.timezone).format('YYYY-MM-DD');
                    const localHour = Number(utcDate.tz(state.timezone).format('H'));
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

            try {
                state.loading = true;
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
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };
        const getRuleSettings = (): RuleSettings => {
            const settings: RuleSettings = {
                ruleType: RULE_TYPE.routine,
                ruleState: RULE_STATE.running,
                ruleWithUTC: {},
                ruleForApi: [],
            };

            if (props.mode !== 'READ') {
                settings.ruleWithUTC = changeTimezoneToUTC(state.rule.routine, RULE_TYPE.routine);
                Object.entries(settings.ruleWithUTC).forEach(([k, v]) => {
                    if (v.length > 0) {
                        settings.ruleForApi.push({ day: k, times: v });
                    }
                });
            } else if (state.oneTimeEditMode) {
                settings.ruleType = RULE_TYPE.ticket;
                if (state.oneTimeEditMode === 'RUN') {
                    settings.ruleWithUTC = changeTimezoneToUTC(state.rule.oneTimeRun, RULE_TYPE.ticket);
                } else if (state.oneTimeEditMode === 'STOP') {
                    settings.ruleState = RULE_STATE.stopped;
                    settings.ruleWithUTC = changeTimezoneToUTC(state.rule.oneTimeStop, RULE_TYPE.ticket);
                }
                Object.entries(settings.ruleWithUTC).forEach(([k, v]) => {
                    if (v.length > 0) {
                        settings.ruleForApi.push({ date: k, times: v });
                    }
                });
            }

            return settings;
        };
        const checkScheduleRuleExist = async (settings: RuleSettings, scheduleId): Promise<string> => {
            const query = new QueryHelper().setFilter(
                {
                    k: 'rule_type',
                    v: settings.ruleType,
                    o: 'eq',
                },
                {
                    k: 'state',
                    v: settings.ruleState,
                    o: 'eq',
                },
            );
            try {
                const res = await SpaceConnector.client.powerScheduler.scheduleRule.list({
                    schedule_id: scheduleId,
                    query: query.data,
                });
                return res.results[0]?.schedule_rule_id || '';
            } catch (e) {
                console.error(e);
            }
            return '';
        };
        const updateOrDelete = async (settings: RuleSettings, scheduleRuleId: string) => {
            try {
                if (settings.ruleForApi.length === 0) {
                    await SpaceConnector.client.powerScheduler.scheduleRule.delete({
                        schedule_rule_id: scheduleRuleId,
                    });
                } else {
                    await SpaceConnector.client.powerScheduler.scheduleRule.update({
                        schedule_rule_id: scheduleRuleId,
                        rule: settings.ruleForApi,
                    });
                }
            } catch (e) {
                console.error(e);
            }
        };
        const create = async (settings: RuleSettings, scheduleId: string) => {
            if (settings.ruleForApi.length === 0) return;
            try {
                await SpaceConnector.client.powerScheduler.scheduleRule.create({
                    user_id: store.state.user.userId,
                    schedule_id: scheduleId,
                    rule_type: settings.ruleType,
                    name: `${settings.ruleType} - ${settings.ruleState}`,
                    state: settings.ruleState,
                    rule: settings.ruleForApi,
                });
            } catch (e) {
                console.error(e);
            }
        };

        const isRuleExist = () => {
            const settings = getRuleSettings();
            return settings.ruleForApi.length > 0;
        };

        const createOrUpdate = async (scheduleId) => {
            const settings = getRuleSettings();

            // check scheduleRule exists
            const scheduleRuleId = await checkScheduleRuleExist(settings, scheduleId);

            // create or update schedule rule
            if (scheduleRuleId) {
                await updateOrDelete(settings, scheduleRuleId);
            } else {
                await create(settings, scheduleId);
            }
        };

        // events
        const onClickCurrentWeek = () => {
            state.currentDate = dayjs();
        };
        const onSelectStart = (e) => {
            state.showHelpBlock = false;
            e.added.forEach((el) => {
                el.classList.add(`selected-${state.editModeClassName}`);
            });
            e.removed.forEach((el) => {
                el.classList.remove(`selected-${state.editModeClassName}`);
            });
        };
        const onSelectEnd = (e) => {
            const setRuleData = (el) => {
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
            e.afterAdded.forEach((el) => {
                el.classList.remove(`selected-${state.editModeClassName}`);
                setRuleData(el);
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
            state.showHelpBlock = false;
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
            state.showHelpBlock = true;
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
                state.oneTimeEditMode = false;
                await getScheduleRule();
                setStyleClass();
            }
        }, { immediate: true });
        watch(() => props.mode, async (after) => {
            if (after === 'CREATE') state.showHelpBlock = true;
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
            onSelectStart,
            onSelectEnd,
            onDeleteAllRoutine,
            onClickStartOneTimeEditMode,
            onClickSaveOneTimeSchedule,
            onClickCancelOneTimeSchedule,
            onClickTimeBlock,
            range,
            isRuleExist,
            createOrUpdate,
        };
    },
};
</script>

<style lang="postcss" scoped>
.schedule-time-table-container {
    width: 100%;
    .title-lap {
        position: relative;
        display: block;
        line-height: 2.25rem;
        margin-bottom: 0.5rem;
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
        .button-lap {
            position: absolute;
            top: 0;
            right: 0;
            .this-week-button {
                @apply border-gray-300;
                margin-left: 1rem;
            }
        }
    }
    .content-lap {
        display: flex;
        .left-lap {
            @apply border border-gray-200;
            display: flex;
            width: 80%;
            .time-section {
                @apply bg-primary3 border-r border-gray-200;
                display: inline-block;
                width: 3rem;
                .icon-item {
                    @apply border-b border-gray-200;
                    height: 3.125rem;
                }
                .time {
                    @apply text-gray-500;
                    height: 1rem;
                    font-size: 0.625rem;
                    text-align: center;
                    line-height: 0.625rem;
                }
            }
            .data-section {
                display: inline-block;
                width: calc(100% - 3rem);
                .loader {
                    position: absolute;
                    top: 50%;
                }
                .weekday-row {
                    @apply bg-primary3 border-b border-gray-200;
                    width: 100%;
                    height: 3.125rem;
                    .weekday-item {
                        @apply text-gray-500 border-l border-gray-200;
                        display: inline-block;
                        width: calc(100% / 7);
                        height: 100%;
                        font-size: 0.75rem;
                        text-align: center;
                        padding: 0.625rem;
                        .weekday-text {
                            font-weight: bold;
                        }
                        &.today {
                            @apply text-primary;
                        }
                        &:first-of-type {
                            @apply border-l-0;
                        }
                    }
                }
                .item-row {
                    @apply bg-white border-b border-gray-200;
                    display: flex;
                    width: 100%;
                    height: 1rem;
                    &:last-child {
                        @apply border-b-0;
                    }
                    .item {
                        @apply border-l border-gray-200;
                        display: inline-flex;
                        width: calc(100% / 7);
                        height: 0.95rem;
                        margin: 0;
                        &:first-child {
                            @apply border-l-0;
                        }
                        &.routine, &.selected-routine {
                            @apply bg-point-violet;
                            border-radius: 0.125rem;
                            &.selected-one-time-run {
                                @apply bg-point-violet;
                            }
                            &.selected-one-time-stop {
                                @apply bg-red-400;
                                opacity: 1;
                            }
                        }
                        &.one-time-run, &.selected-one-time-run {
                            @apply bg-peacock-300;
                            border-radius: 0.125rem;
                        }
                        &.one-time-stop, &.selected-one-time-stop {
                            @apply bg-red-400;
                            border-radius: 0.125rem;
                            &:not(.routine) {
                                @apply bg-transparent;
                            }
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
        .right-lap {
            @apply border border-gray-200 border-l-0;
            position: relative;
            width: 20%;
            font-size: 0.875rem;
            padding: 1.5rem;
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
                .edit-button {
                    @apply border-gray-300;
                    margin-left: 0.5rem;
                }
                .making-ticket-text {
                    @apply bg-blue-200 text-secondary;
                    font-size: 0.75rem;
                    margin-left: 1rem;
                    padding-left: 0.5rem;
                    padding-right: 0.5rem;
                }
            }
            .one-time-button-lap {
                position: absolute;
                bottom: 1.5rem;
                left: 0;
                width: 100%;
                text-align: center;
                .p-button {
                    @apply border-gray-300;
                    height: 1.25rem;
                    margin-top: 0.5rem;
                }
            }
        }
    }
}
</style>
