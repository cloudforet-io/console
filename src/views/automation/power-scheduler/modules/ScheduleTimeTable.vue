<template>
    <div class="schedule-time-table-container">
        <div class="title-wrapper">
            <span class="title">{{ $t('PWR_SCHED.TIME') }}</span>
            <span class="sub-title">{{ $t('PWR_SCHED.SCHED_TIME') }}</span>
            <div class="button-wrapper">
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
        <div class="content-wrapper">
            <div class="left-part" :class="{'editing': isCreateMode || isEditMode}">
                <div class="time-section">
                    <div class="icon-item" />
                    <div v-for="time in range(0, 24)"
                         :key="time"
                         class="time"
                         :class="hoveredTime === time ? 'hovered' : ''"
                    >
                        {{ ('0' + time).slice(-2) }}
                    </div>
                </div>
                <div ref="draggableSection" class="data-section">
                    <div class="weekday-row">
                        <div
                            v-for="(weekday, index) in currentWeekList"
                            :key="index"
                            class="weekday-item"
                            :class="{'today': weekday.format('YYYY-MM-DD') === today}"
                        >
                            <div class="weekday-text">
                                {{ weekday.format('YYYY-MM-DD') === today ? $t('PWR_SCHED.TODAY') : weekdayTexts[weekday.day()] }}
                            </div>
                            <div class="weekday-number-text">
                                {{ weekday.format('D') }}
                            </div>
                        </div>
                    </div>
                    <vue-selecto
                        v-if="isCreateMode || isEditMode"
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
                                <p-lottie name="thin-spinner" class="flex justify-center"
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
                            @mouseenter="onMouseEnterTimeBlock(time)"
                            @mouseleave="onMouseLeaveTimeBlock"
                        />
                    </div>
                    <div v-if="showHelpBlock" class="help-block">
                        <p class="help-text">
                            날짜와 시간을 클릭/드래그하여 타이머를 적용하세요. 재 클릭시 해제할 수 있습니다.<br>
                            <b>*주의: 아무 설정도 없는 경우 모든 리소스의 작동이 멈추게 됩니다.</b>
                        </p>
                        <p-i name="cursor_pointer--blue" class="cursor-icon"
                             width="2rem" height="2rem"
                             color="white inherit"
                        />
                    </div>
                </div>
            </div>
            <div class="right-part" :class="{'editing': isCreateMode || isEditMode}">
                <!--timezone-->
                <div class="pb-8" :class="isEditMode ? 'opacity-25' : ''">
                    <div class="title pt-0">
                        {{ $t('PWR_SCHED.TIMEZONE') }}
                    </div>
                    <div class="text-gray-400">
                        {{ timezone }}
                    </div>
                </div>
                <!--routine-->
                <div class="pb-8" :class="{'opacity-25': isEditMode && editMode !== 'routine'}">
                    <div class="title">
                        {{ $t('PWR_SCHED.SCHED_ROUTINE') }}
                    </div>
                    <div class="legend-wrapper routine">
                        <span class="legend-icon" />
                        <span>{{ $t('PWR_SCHED.ROUTINE_ON') }}</span>
                        <p-button v-if="!isCreateMode && !isEditMode"
                                  class="edit-button gray900 sm ml-2" :outline="true"
                                  @click="onClickStartEditMode('routine')"
                        >
                            {{ $t('PWR_SCHED.EDIT') }}
                        </p-button>
                    </div>
                    <div class="legend-wrapper routine-off">
                        <span class="legend-icon" />
                        <span v-if="!(isCreateMode || (isEditMode && editMode === 'routine'))">{{ $t('PWR_SCHED.STOP_SCHED') }}</span>
                        <p-button v-if="isCreateMode || (isEditMode && editMode === 'routine')"
                                  class="edit-button gray900 sm" :outline="true"
                                  @click="onDeleteAllRoutine"
                        >
                            {{ $t('PWR_SCHED.DELETE_ALL') }}
                        </p-button>
                    </div>
                </div>
                <!--one time ticket-->
                <div v-if="!isCreateMode" :class="{'opacity-25': isEditMode && editMode === 'routine'}">
                    <div class="title">
                        {{ $t('PWR_SCHED.SCHED_ONE_TIME') }}
                    </div>
                    <div class="legend-wrapper one-time-run" :class="{'opacity-25': isEditMode && editMode !== 'oneTimeRun'}">
                        <span class="legend-icon" />
                        <span>{{ $t('PWR_SCHED.RUN_SCHED') }}</span>
                        <p-button v-if="!isEditMode"
                                  class="edit-button gray900 sm ml-2" :outline="true"
                                  @click="onClickStartEditMode('oneTimeRun')"
                        >
                            {{ $t('PWR_SCHED.EDIT') }}
                        </p-button>
                    </div>
                    <div class="legend-wrapper one-time-stop" :class="{'opacity-25': isEditMode && editMode !== 'oneTimeStop'}">
                        <span class="legend-icon" />
                        <span>{{ $t('PWR_SCHED.STOP_SCHED') }}</span>
                        <p-button v-if="!isEditMode"
                                  class="edit-button gray900 sm ml-2" :outline="true"
                                  @click="onClickStartEditMode('oneTimeStop')"
                        >
                            {{ $t('PWR_SCHED.EDIT') }}
                        </p-button>
                    </div>
                </div>
                <!--buttons-->
                <div class="one-time-button-wrapper">
                    <p-button v-if="isEditMode"
                              class="gray900 mr-4" :outline="true"
                              @click="onClickCancel"
                    >
                        {{ $t('PWR_SCHED.CANCEL') }}
                    </p-button>
                    <p-button v-if="isEditMode"
                              class="secondary"
                              @click="onClickSave"
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
import {showErrorMessage, showSuccessMessage} from "@/lib/util";

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
enum EDIT_MODE {
    routine = 'routine',
    oneTimeRun = 'oneTimeRun',
    oneTimeStop = 'oneTimeStop',
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
    setup(props: Props, { emit, refs, root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: false,
            // date
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
            isCreateMode: computed(() => props.mode === 'CREATE'),
            isEditMode: false as boolean,
            editMode: undefined as undefined | keyof typeof EDIT_MODE, // oneTimeRun, oneTimeStop
            editModeClassName: computed(() => {
                if (state.editMode === EDIT_MODE.routine) return 'routine';
                if (state.editMode === EDIT_MODE.oneTimeRun) return 'one-time-run';
                if (state.editMode === EDIT_MODE.oneTimeStop) return 'one-time-stop';
                return '';
            }),
            dragContainer: undefined,
            rule: {
                routine: {} as Rule,
                oneTimeRun: {} as Rule,
                oneTimeStop: {} as Rule,
            },
            showHelpBlock: false,
            //
            hoveredTime: null,
        });

        /* util */
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
                    if (state.isEditMode && (state.editMode !== EDIT_MODE.routine)) item.classList.add('opacity-25');
                }

                // one time
                if (!state.isCreateMode) {
                    // run
                    if (!state.isEditMode || (state.isEditMode && state.editMode === EDIT_MODE.oneTimeRun)) {
                        rules = get(state.rule.oneTimeRun, date);
                        if (rules && rules.includes(time)) {
                            if (!item.classList.contains('one-time-run')) item.classList.add('one-time-run');
                        }
                    }

                    // stop
                    if (!state.isEditMode || (state.isEditMode && state.editMode === EDIT_MODE.oneTimeStop)) {
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
            let newRule = {};

            if (ruleType === RULE_TYPE.routine) {
                newRule = {
                    sun: [],
                    mon: [],
                    tue: [],
                    wed: [],
                    thu: [],
                    fri: [],
                    sat: [],
                };
                const offsetHours = (dayjs().tz(state.timezone).utcOffset()) / 60;
                const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
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
            } else if (ruleType === RULE_TYPE.ticket) {
                if (state.timezone === 'UTC') newRule = rule;
                else {
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
                }
            }

            return newRule;
        };

        /* api */
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

            if (state.isCreateMode || state.editMode === EDIT_MODE.routine) {
                settings.ruleWithUTC = changeTimezoneToUTC(state.rule.routine, RULE_TYPE.routine);
                Object.entries(settings.ruleWithUTC).forEach(([k, v]) => {
                    // todo: if문 삭제해야 함
                    if (v.length > 0) {
                        settings.ruleForApi.push({ day: k, times: v });
                    }
                });
            } else {
                settings.ruleType = RULE_TYPE.ticket;
                if (state.editMode === EDIT_MODE.oneTimeRun) {
                    settings.ruleWithUTC = changeTimezoneToUTC(state.rule.oneTimeRun, RULE_TYPE.ticket);
                } else if (state.editMode === EDIT_MODE.oneTimeStop) {
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
                if (props.mode !== 'CREATE') showSuccessMessage(vm.$t('PWR_SCHED.SUCCESS'), vm.$t('PWR_SCHED.TT.EDIT_SUCCESS'), root);
            } catch (e) {
                console.error(e);
                if (props.mode !== 'CREATE') showErrorMessage(vm.$t('PWR_SCHED.TT.EDIT_FAIL'), e, root);
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

        /* event */
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

                if (state.isCreateMode || state.editMode === EDIT_MODE.routine) {
                    if (routineTimes && routineTimes.includes(time)) return;
                    if (state.rule.routine[week]) state.rule.routine[week].push(time);
                    else state.rule.routine[week] = [time];
                } else {
                    // prevent adding run(stop) tickets when the rule is (not) routine
                    const isRoutineTime = routineTimes && routineTimes.includes(time);
                    if (state.editMode === EDIT_MODE.oneTimeRun) {
                        const oneTimeTimes = get(state.rule.oneTimeRun, date);
                        if (isRoutineTime) return;
                        if (oneTimeTimes && oneTimeTimes.includes(time)) return;
                        if (state.rule.oneTimeRun[date]) state.rule.oneTimeRun[date].push(time);
                        else state.rule.oneTimeRun[date] = [time];
                    } else if (state.editMode === EDIT_MODE.oneTimeStop) {
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
            if (!(state.isCreateMode || state.isEditMode)) return;

            const classList = e.target.classList;
            const date = classList[1];
            const week = classList[2].split('-')[0].toLowerCase();
            const time = Number(classList[2].split('-')[1]);

            const routineTimes = get(state.rule.routine, week);
            const isRoutineTime = routineTimes && routineTimes.includes(time);

            if (state.isCreateMode || state.editMode === 'routine') {
                if (routineTimes && routineTimes.includes(time)) { // already exists
                    const idx = routineTimes.indexOf(time);
                    state.rule.routine[week].splice(idx, 1);
                } else if (state.rule.routine[week]) {
                    state.rule.routine[week].push(time);
                } else {
                    state.rule.routine[week] = [time];
                }
            } else {
                if (state.editMode === 'oneTimeRun' && isRoutineTime) return;
                if (state.editMode === 'oneTimeStop' && !isRoutineTime) return;

                const oneTimeTimes = get(state.rule[state.editMode], date);
                if (oneTimeTimes && oneTimeTimes.includes(time)) { // already exists
                    const idx = oneTimeTimes.indexOf(time);
                    state.rule[state.editMode][date].splice(idx, 1);
                } else if (state.rule[state.editMode][date]) {
                    state.rule[state.editMode][date].push(time);
                } else {
                    state.rule[state.editMode][date] = [time];
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
        const onClickStartEditMode = (type) => {
            state.isEditMode = true;
            state.editMode = type;
            setStyleClass();
            emit('edit-start');
        };
        const onClickSave = async () => {
            await createOrUpdate(props.scheduleId);
            await getScheduleRule();

            state.isEditMode = false;
            setStyleClass();
            emit('edit-finish');
        };
        const onClickCancel = async () => {
            state.isEditMode = false;
            await getScheduleRule();
            setStyleClass();
            emit('edit-finish');
        };
        const onMouseEnterTimeBlock = (time) => {
            state.hoveredTime = time;
        };
        const onMouseLeaveTimeBlock = () => {
            state.hoveredTime = null;
        };

        /* etc */
        const isRuleExist = () => {
            const settings = getRuleSettings();
            return settings.ruleForApi.length > 0;
        };

        watch(() => props.scheduleId, async (after, before) => {
            if (after !== before) {
                state.editMode = false;
                await getScheduleRule();
                setStyleClass();
            }
        }, { immediate: true });
        watch(() => props.mode, async (after) => {
            if (after === 'CREATE') {
                state.showHelpBlock = true;
                state.editMode = EDIT_MODE.routine;
            } else {
                state.showHelpBlock = false;
                await getScheduleRule();
                setStyleClass();
            }
        }, { immediate: true });
        watch(() => state.currentDate, () => {
            setStyleClass();
        });
        watch(() => state.timezone, async () => {
            await getScheduleRule();
            setStyleClass();
        });
        watch(() => state.isEditMode, (after) => {
            if (!after) {
                state.showHelpBlock = false;
            }
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
            onClickStartEditMode,
            onClickSave,
            onClickCancel,
            onClickTimeBlock,
            onMouseEnterTimeBlock,
            onMouseLeaveTimeBlock,
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
    .title-wrapper {
        position: relative;
        display: block;
        line-height: 2.25rem;
        margin-bottom: 0.5rem;
        .title {
            @apply text-gray-900;
            font-size: 1.125rem;
            font-weight: bold;
            padding-right: 0.5rem;
        }
        .sub-title {
            @apply text-gray-400;
            font-size: 0.75rem;
        }
        .button-wrapper {
            position: absolute;
            top: 0;
            right: 0;
            .this-week-button {
                margin-left: 1rem;
            }
        }
    }
    .content-wrapper {
        display: flex;
        .left-part {
            @apply border border-gray-200;
            border-top-left-radius: 2px;
            border-bottom-left-radius: 2px;
            display: flex;
            width: 80%;
            &.editing {
                .time-section {
                    @apply bg-secondary2;
                    .time {
                        &.hovered {
                            background-color: rgba(theme('colors.blue.300'), 0.5);
                        }
                    }
                }
                .data-section {
                    .weekday-row {
                        @apply bg-secondary2;
                    }
                    .item-row {
                        &:hover {
                            background-color: rgba(theme('colors.blue.300'), 0.5);
                        }
                    }
                }
            }
            .time-section {
                @apply border-r border-gray-200;
                display: inline-block;
                width: 3rem;
                cursor: default;
                .icon-item {
                    @apply border-b border-gray-200;
                    height: 3rem;
                }
                .time {
                    @apply text-gray-900;
                    height: 1rem;
                    font-size: 0.625rem;
                    text-align: center;
                }
            }
            .data-section {
                position: relative;
                display: inline-block;
                width: calc(100% - 3rem);
                .loader {
                    position: absolute;
                    top: 50%;
                }
                .weekday-row {
                    @apply border-b border-gray-200;
                    /*display: flex;*/
                    width: 100%;
                    height: 3rem;
                    cursor: default;
                    .weekday-item {
                        @apply text-gray-900 border-l border-gray-200;
                        display: inline-block;
                        width: calc(100% / 7);
                        height: 100%;
                        font-size: 0.625rem;
                        text-align: center;
                        padding: 0.3rem;
                        .weekday-number-text {
                            width: 1.25rem;
                            height: 1.25rem;
                            line-height: 1.25rem;
                            border-radius: 50%;
                            margin: auto;
                        }
                        &.today {
                            .weekday-text {
                                @apply text-secondary;
                            }
                            .weekday-number-text {
                                @apply bg-secondary text-white;
                            }
                        }
                        &:first-of-type {
                            @apply border-l-0;
                        }
                    }
                }
                .item-row {
                    @apply bg-gray-200 border-b border-white;
                    display: flex;
                    width: 100%;
                    height: 1rem;
                    &:last-child {
                        @apply border-b-0;
                    }
                    .item {
                        @apply border-l border-white;
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
                            &.one-time-stop, &.selected-one-time-stop {
                                background: repeating-linear-gradient(
                                        45deg,
                                        rgba(theme('colors.gray.700'), 0.5),
                                        rgba(theme('colors.gray.700'), 0.5) 3px,
                                        transparent 3px,
                                        transparent 6px
                                );
                            }
                        }
                        &.one-time-run, &.selected-one-time-run {
                            background: repeating-linear-gradient(
                                    45deg,
                                    rgba(theme('colors.point-violet'), 0.5),
                                    rgba(theme('colors.point-violet'), 0.5) 3px,
                                    theme('colors.point-violet') 3px,
                                    theme('colors.point-violet') 6px
                            );
                            border-radius: 0.125rem;
                        }
                        &.one-time-stop, &.selected-one-time-stop {
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
                    width: calc(100% / 7 * 5);
                    height: 4rem;
                    top: 12rem;
                    left: calc(100% / 7);
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
        .right-part {
            @apply border border-gray-200 border-l-0;
            position: relative;
            width: 20%;
            font-size: 0.875rem;
            border-top-right-radius: 2px;
            border-bottom-right-radius: 2px;
            padding: 1.5rem;
            &.editing {
                @apply bg-secondary2;
            }
            .title {
                @apply text-gray-900;
                font-weight: bold;
                line-height: 1.5rem;
                padding-bottom: 0.5rem;
                &.activated {
                    @apply text-secondary;
                }
            }
            .legend-wrapper {
                line-height: 1.5rem;
                vertical-align: middle;
                padding-bottom: 0.5rem;
                &.routine {
                    @apply text-point-violet;
                    .legend-icon {
                        @apply bg-point-violet;
                    }
                }
                &.routine-off {
                    @apply text-gray-400;
                    .legend-icon {
                        @apply bg-gray-300;
                    }
                }
                &.one-time-run {
                    @apply text-point-violet;
                    .legend-icon {
                        background: repeating-linear-gradient(
                                45deg,
                                rgba(theme('colors.pointViolet'), 0.5),
                                rgba(theme('colors.pointViolet'), 0.5) 3px,
                                theme('colors.pointViolet') 3px,
                                theme('colors.pointViolet') 6px
                        );
                    }
                }
                &.one-time-stop {
                    @apply text-gray-400;
                    .legend-icon {
                        background: repeating-linear-gradient(
                                45deg,
                                rgba(theme('colors.gray.700'), 0.5),
                                rgba(theme('colors.gray.700'), 0.5) 3px,
                                theme('colors.gray.700') 3px,
                                theme('colors.gray.700') 6px
                        );
                    }
                }
                .legend-icon {
                    position: relative;
                    display: inline-block;
                    width: 0.75rem;
                    height: 0.75rem;
                    border-radius: 2px;
                    margin-right: 0.5rem;
                }
                .edit-button {
                    height: 20px;
                    padding: 0 0.5rem;
                }
            }
            .one-time-button-wrapper {
                position: absolute;
                bottom: 1.5rem;
                right: 1.5rem;
                width: 100%;
                text-align: right;
                .p-button {
                    min-width: 4rem;
                    max-width: 7rem;
                }
            }
        }
    }
}
.p-button.gray900 {
    @apply border-gray-300;
    &:hover {
        @apply border-gray-900;
    }
}
</style>
