<template>
    <div class="schedule-time-table-container">
        <div class="title-wrapper">
            <span class="title">{{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.SET_TIME_TITLE') }}</span>
            <span class="sub-title">{{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.SET_TIME_DESC') }}</span>
            <div class="button-wrapper">
                <p-date-pagination :date.sync="currentDate" :allow-future="true" type="week"
                                   :timezone="timezone"
                />
                <p-button class="gray900 this-week-button" block
                          :outline="true"
                          @click="onClickCurrentWeek"
                >
                    {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.THIS_WEEK') }}
                </p-button>
            </div>
        </div>
        <div class="content-wrapper">
            <div class="left-part" :class="{'editing': isCreateMode || isEditMode}">
                <div class="time-section">
                    <div class="empty-box" />
                    <div v-for="time in range(0, 24)"
                         :key="time"
                         class="time"
                         :class="{
                             'hovered': hoveredTime === time,
                             'current': time === currentHour,
                         }"
                    >
                        {{ time === currentHour ? `${('0' + time).slice(-2)}:${('0' + currentMinute).slice(-2)}` : ('0' + time).slice(-2) }}
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
                                {{ weekday.format('YYYY-MM-DD') === today ? $t('AUTOMATION.POWER_SCHEDULER.DETAILS.DAY_TODAY') : weekdayTexts[weekday.day()] }}
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
                        <div v-if="time === currentHour" class="current-time-bar" :style="currentTimeBarStyle" />
                    </div>
                    <div v-if="showHelpBlock" class="help-block">
                        <p class="help-text">
                            {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.TIME_TABLE_HINT_TEXT_1') }}<br>
                            <b class="text-base">{{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.TIME_TABLE_HINT_TEXT_2') }}</b>
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
                        {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.TIMEZONE') }}
                    </div>
                    <div class="text-gray-400">
                        {{ timezone }}
                    </div>
                </div>
                <!--routine-->
                <div class="pb-8" :class="{'opacity-25': isEditMode && editMode !== 'routine'}">
                    <div class="title">
                        {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.ROUTINE_SCHEDULE') }}
                    </div>
                    <div class="legend-wrapper routine">
                        <span class="legend-icon" />
                        <span>{{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.ROUTINE_ON') }}</span>
                        <p-button v-if="!isCreateMode && !isEditMode"
                                  class="edit-button gray900 sm ml-2" :outline="true"
                                  @click="onClickStartEditMode('routine')"
                        >
                            {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.EDIT') }}
                        </p-button>
                    </div>
                    <div class="legend-wrapper routine-off">
                        <span class="legend-icon" />
                        <span v-if="!(isCreateMode || (isEditMode && editMode === 'routine'))">{{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.OFF') }}</span>
                        <p-button v-if="isCreateMode || (isEditMode && editMode === 'routine')"
                                  class="edit-button gray900 sm" :outline="true"
                                  @click="onDeleteAllRoutine"
                        >
                            {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.DELETE_ALL') }}
                        </p-button>
                    </div>
                </div>
                <!--one time ticket-->
                <div v-if="!isCreateMode" :class="{'opacity-25': isEditMode && editMode === 'routine'}">
                    <div class="title">
                        {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.ONE_TIME_SCHEDULE') }}
                    </div>
                    <div class="legend-wrapper one-time-run" :class="{'opacity-25': isEditMode && editMode !== 'oneTimeRun'}">
                        <span class="legend-icon" />
                        <span>{{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.ON') }}</span>
                        <p-button v-if="!isEditMode"
                                  class="edit-button gray900 sm ml-2" :outline="true"
                                  @click="onClickStartEditMode('oneTimeRun')"
                        >
                            {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.EDIT') }}
                        </p-button>
                    </div>
                    <div class="legend-wrapper one-time-stop" :class="{'opacity-25': isEditMode && editMode !== 'oneTimeStop'}">
                        <span class="legend-icon" />
                        <span>{{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.OFF') }}</span>
                        <p-button v-if="!isEditMode"
                                  class="edit-button gray900 sm ml-2" :outline="true"
                                  @click="onClickStartEditMode('oneTimeStop')"
                        >
                            {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.EDIT') }}
                        </p-button>
                    </div>
                </div>
                <!--buttons-->
                <div class="edit-button-wrapper">
                    <p-button v-if="isEditMode"
                              class="gray900 mr-4" :outline="true"
                              @click="onClickCancel"
                    >
                        {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.CANCEL') }}
                    </p-button>
                    <p-button v-if="isEditMode"
                              class="secondary"
                              @click="onClickSave"
                    >
                        {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.SAVE') }}
                    </p-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { get, map, range } from 'lodash';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { VueSelecto } from 'vue-selecto';

import {
    ComponentRenderProxy,
    computed,
    getCurrentInstance,
    onMounted,
    reactive,
    toRefs,
    watch,
} from '@vue/composition-api';

import {
    PI, PDatePagination, PButton, PLottie,
} from '@spaceone/design-system';

import {
    RoutineRule,
    Rule, RULE_STATE, RULE_TYPE, TicketRule, ViewMode,
} from '@/views/automation/power-scheduler/type';

import { changeTimezoneToLocal, changeTimezoneToUTC } from '@/views/automation/power-scheduler/lib/util';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { store } from '@/store';
import { timezoneList } from '@/store/modules/user/config';

dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);


enum EDIT_MODE {
    routine = 'routine',
    oneTimeRun = 'oneTimeRun',
    oneTimeStop = 'oneTimeStop',
}

interface RuleSettings {
    ruleType: RULE_TYPE;
    ruleState: RULE_STATE;
    ruleWithUTC: RoutineRule[] | TicketRule[];
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
            weekdayTexts: computed(() => ([
                vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.DAY_SUN'),
                vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.DAY_MON'),
                vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.DAY_TUE'),
                vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.DAY_WED'),
                vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.DAY_THU'),
                vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.DAY_FRI'),
                vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.DAY_SAT'),
            ])),
            timezones: map(timezoneList, d => ({
                type: 'item', label: d === 'UTC' ? `${d} (default)` : d, name: d,
            })),
            timezone: computed(() => store.state.user.timezone),
            today: computed(() => {
                if (state.timezone === 'UTC') return dayjs().utc().format('YYYY-MM-DD');
                return dayjs().tz(state.timezone).format('YYYY-MM-DD');
            }),
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
            currentHour: computed(() => {
                if (state.timezone === 'UTC') return Number(dayjs().utc().format('HH'));
                return Number(dayjs().tz(state.timezone).format('HH'));
            }),
            currentMinute: computed(() => {
                if (state.timezone === 'UTC') return Number(dayjs().utc().format('mm'));
                return Number(dayjs().tz(state.timezone).format('mm'));
            }),
            currentTimeBarStyle: computed(() => {
                if (60 / state.currentMinute > 4) return { top: 0 };
                if (60 / state.currentMinute > 2) return { top: '25%' };
                if (60 / state.currentMinute > 4 / 3) return { top: '50%' };
                return { top: '75%' };
            }),
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
                    const scheduleRuleWithTimezone = changeTimezoneToLocal(scheduleRule.rule, scheduleRule.rule_type, state.timezone);
                    if (scheduleRule.rule_type === RULE_TYPE.routine) {
                        scheduleRuleWithTimezone.forEach((r) => {
                            state.rule.routine[r.day] = r.times;
                        });
                    } else if (scheduleRule.rule_type === RULE_TYPE.ticket && scheduleRule.state === RULE_STATE.running) {
                        scheduleRuleWithTimezone.forEach((r) => {
                            state.rule.oneTimeRun[r.date] = r.times;
                        });
                    } else if (scheduleRule.rule_type === RULE_TYPE.ticket && scheduleRule.state === RULE_STATE.stopped) {
                        scheduleRuleWithTimezone.forEach((r) => {
                            state.rule.oneTimeStop[r.date] = r.times;
                        });
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
                ruleWithUTC: [],
            };

            const scheduleRule = [] as RoutineRule[] | TicketRule[];
            if (state.isCreateMode || state.editMode === EDIT_MODE.routine) {
                Object.keys(state.rule.routine).forEach((k) => {
                    scheduleRule.push({ day: k, times: state.rule.routine[k] });
                });
                settings.ruleWithUTC = changeTimezoneToUTC(scheduleRule, RULE_TYPE.routine, state.timezone);
            } else {
                settings.ruleType = RULE_TYPE.ticket;
                if (state.editMode === EDIT_MODE.oneTimeRun) {
                    Object.keys(state.rule.oneTimeRun).forEach((k) => {
                        scheduleRule.push({ date: k, times: state.rule.oneTimeRun[k] });
                    });
                } else if (state.editMode === EDIT_MODE.oneTimeStop) {
                    settings.ruleState = RULE_STATE.stopped;
                    Object.keys(state.rule.oneTimeStop).forEach((k) => {
                        scheduleRule.push({ date: k, times: state.rule.oneTimeStop[k] });
                    });
                }
                settings.ruleWithUTC = changeTimezoneToUTC(scheduleRule, RULE_TYPE.ticket, state.timezone);
            }
            return settings;
        };
        const apiQuery = new ApiQueryHelper();
        const checkScheduleRuleExist = async (settings: RuleSettings, scheduleId): Promise<string> => {
            apiQuery.setFilters(
                [{
                    k: 'rule_type',
                    v: settings.ruleType,
                    o: '=',
                },
                {
                    k: 'state',
                    v: settings.ruleState,
                    o: '=',
                }],
            );
            try {
                const res = await SpaceConnector.client.powerScheduler.scheduleRule.list({
                    schedule_id: scheduleId,
                    query: apiQuery.data,
                });
                return res.results[0]?.schedule_rule_id || '';
            } catch (e) {
                console.error(e);
            }
            return '';
        };
        const updateOrDelete = async (settings: RuleSettings, scheduleRuleId: string) => {
            try {
                if (settings.ruleWithUTC.length === 0) {
                    await SpaceConnector.client.powerScheduler.scheduleRule.delete({
                        schedule_rule_id: scheduleRuleId,
                    });
                } else {
                    await SpaceConnector.client.powerScheduler.scheduleRule.update({
                        schedule_rule_id: scheduleRuleId,
                        rule: settings.ruleWithUTC,
                    });
                }
                if (props.mode !== 'CREATE') {
                    showSuccessMessage(vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.ALT_S_EDIT_SCHEDULER'), '', root);
                }
            } catch (e) {
                console.error(e);
                if (props.mode !== 'CREATE') {
                    showErrorMessage(vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.ALT_E_EDIT_SCHEDULER'), e, root);
                }
            }
        };
        const create = async (settings: RuleSettings, scheduleId: string) => {
            if (settings.ruleWithUTC.length === 0) return;
            try {
                await SpaceConnector.client.powerScheduler.scheduleRule.create({
                    user_id: store.state.user.userId,
                    schedule_id: scheduleId,
                    rule_type: settings.ruleType,
                    name: `${settings.ruleType} - ${settings.ruleState}`,
                    state: settings.ruleState,
                    rule: settings.ruleWithUTC,
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

        /* etc */
        const isRuleExist = () => {
            const settings = getRuleSettings();
            return settings.ruleWithUTC.some(d => d.times.length > 0);
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
            if (!isRuleExist()) {
                emit('open-check-modal');
                return;
            }

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
                .empty-box {
                    @apply border-b border-gray-200;
                    height: 3rem;
                }
                .time {
                    @apply text-gray-900;
                    height: 1rem;
                    font-size: 0.625rem;
                    text-align: center;
                    &.current {
                        @apply text-secondary;
                    }
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
                    @apply border-b border-white;
                    position: relative;
                    display: flex;
                    width: 100%;
                    height: 1rem;
                    background-color: rgba(theme('colors.gray.200'), 0.75);
                    &:last-child {
                        @apply border-b-0;
                    }
                    .item {
                        @apply border-l border-white;
                        display: inline-flex;
                        width: calc(100% / 7);
                        height: 95%;
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
                                background:
                                    repeating-linear-gradient(
                                        45deg,
                                        rgba(theme('colors.gray.700'), 0.5),
                                        rgba(theme('colors.gray.700'), 0.5) 3px,
                                        transparent 3px,
                                        transparent 6px
                                    );
                            }
                        }
                        &.one-time-run, &.selected-one-time-run {
                            background:
                                repeating-linear-gradient(
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
                    .current-time-bar {
                        @apply border-b border-secondary;
                        position: absolute;
                        width: 100%;
                        pointer-events: none;
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
                        line-height: 1.125rem;
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
                        background:
                            repeating-linear-gradient(
                                45deg,
                                rgba(theme('colors.point-violet'), 0.5),
                                rgba(theme('colors.point-violet'), 0.5) 3px,
                                theme('colors.point-violet') 3px,
                                theme('colors.point-violet') 6px
                            );
                    }
                }
                &.one-time-stop {
                    @apply text-gray-400;
                    .legend-icon {
                        background:
                            repeating-linear-gradient(
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
            .edit-button-wrapper {
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
