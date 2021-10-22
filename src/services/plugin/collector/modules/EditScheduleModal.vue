<template>
    <p-button-modal
        class="edit-schedule-modal-container"
        :header-title="editMode ? $t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TITLE_UPDATE') : $t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TITLE_ADD')"
        centered
        fade
        backdrop
        size="lg"
        :loading="loading"
        :visible.sync="proxyVisible"
        @confirm="onClickEditConfirm"
    >
        <template #body>
            <p-field-group :label="$t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_NAME_LABEL')">
                <p-text-input v-model="formState.name" class="name" :placeholder="$t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_NAME_PLACEHOLDER')" />
            </p-field-group>
            <p-field-group :label="$t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIMEZONE_LABEL')">
                <p-select-dropdown v-model="formState.timezone" :items="timezones"
                                   class="timezone"
                                   use-fixed-menu-style
                                   @select="changeTimezone"
                />
            </p-field-group>
            <p-field-group :label="$t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_LABEL')"
                           required
                           :invalid="validationState.showValidation && !validationState.isValid"
                           :invalid-text="validationState.invalidText"
            >
                <template #label-extra>
                    <span class="label-help-text">{{ $t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_DESC') }}</span>
                </template>
                <div v-for="(type, idx) in Object.keys(scheduleTypes)" :key="idx"
                     class="time-schedule-wrapper block lg:flex h-48 lg:h-40"
                     :class="formState.scheduleType === type ? 'selected' : ''"
                     @click="formState.scheduleType = type"
                >
                    <div class="w-full lg:w-1/3 pb-4 lg:pb-0">
                        <p-radio
                            v-model="formState.scheduleType"
                            :value="type"
                        >
                            <template #icon>
                                <p-i class="radio-icon" width="1.25rem" height="1.25rem"
                                     :name="formState.scheduleType === type ? 'ic_checkbox_circle--checked' : 'ic_radio'"
                                />
                            </template>
                        </p-radio>
                        <span class="schedule-type-text">
                            {{ scheduleTypes[type] }}
                        </span>
                    </div>
                    <div class="w-full lg:w-2/3 m-auto">
                        <div v-if="type === 'hourly'" class="hourly-schedule-wrapper">
                            <span v-for="(hour) in hoursMatrix" :key="hour"
                                  class="time-block"
                                  :class="{active: formState.selectedHours[hour] }"
                                  @click="onClickHour(hour)"
                            >
                                {{ hour }}
                            </span>
                            <p-button class="all-button"
                                      :class="[isAllHours ? 'all-selected' : '']"
                                      style-type="secondary"
                                      @click="onClickAllHours"
                            >
                                {{ $t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_ALL') }}
                            </p-button>
                        </div>
                        <div v-else class="interval-wrapper">
                            <p-field-group :label="$t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_EVERY_LABEL')" required class="w-full flex">
                                <div class="ml-4 flex-grow inline-flex">
                                    <p-text-input v-model="formState.intervalTime" class="w-1/2" type="number"
                                                  :placeholder="$t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_INTERVAL_PLACEHOLDER')"
                                    />
                                    <p-select-dropdown v-model="formState.intervalTimeType" class="w-1/2" :items="intervalTimeTypes"
                                                       use-fixed-menu-style
                                    />
                                </div>
                            </p-field-group>
                        </div>
                    </div>
                </div>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    range, get, forEach, size, map,
} from 'lodash';
import dayjs, { Dayjs } from 'dayjs';

import {
    reactive, toRefs, computed, watch, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import {
    PButtonModal, PSelectDropdown, PFieldGroup, PRadio, PButton, PTextInput, PI,
} from '@spaceone/design-system';

import { ScheduleAddParameter, ScheduleUpdateParameter } from '@/services/plugin/collector/type';
import { TranslateResult } from 'vue-i18n';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { makeProxy } from '@/lib/helper/composition-helpers';
import { store } from '@/store';
import { timezoneList } from '@/store/modules/user/config';
import { i18n } from '@/translations';


interface ScheduleHours {
    [time: string]: Dayjs;
}

interface ScheduleType {
    hourly: string | TranslateResult;
    interval?: string | TranslateResult;
}

const INTERVAL_MAX_SECONDS = 3600;
const INTERVAL_MIN_SECONDS = 30;

export default {
    name: 'EditScheduleModal',
    components: {
        PI,
        PRadio,
        PTextInput,
        PButton,
        PSelectDropdown,
        PFieldGroup,
        PButtonModal,
    },
    props: {
        /* sync */
        visible: Boolean,
        collectorId: {
            type: String,
            default: '',
        },
        scheduleId: {
            type: String,
            default: '',
        },
        editMode: {
            type: Boolean,
            default: true,
        },
        supportedSchedules: {
            type: Array,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const formState = reactive({
            name: '',
            timezone: store.state.user.timezone || 'UTC',
            selectedHours: {} as ScheduleHours,
            selectedUTCHoursList: computed(() => {
                const utcHours = [] as number[];
                forEach(formState.selectedHours, (time) => {
                    utcHours.push(time.utc().hour());
                });
                return utcHours;
            }),
            scheduleType: 'hourly',
            intervalTimeType: 'minutes',
            intervalTime: undefined as undefined | number,
            intervalTimeInSeconds: computed(() => {
                if (formState.intervalTime) {
                    if (formState.intervalTimeType === 'minutes') return formState.intervalTime * 60;
                    if (formState.intervalTimeType === 'hours') return formState.intervalTime * 3600;
                }
                return formState.intervalTime;
            }),
        });
        const state = reactive({
            loading: false,
            schedule: null,
            proxyVisible: makeProxy('visible', props, emit),
            //
            hoursMatrix: range(24),
            timezones: map(timezoneList, d => ({
                type: 'item', label: d === 'UTC' ? `${d} (default)` : d, name: d,
            })),
            scheduleTypes: computed(() => {
                const result: ScheduleType = {
                    hourly: i18n.t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_HOURLY_LABEL'),
                };
                if (props.supportedSchedules && props.supportedSchedules.includes('interval')) {
                    result.interval = i18n.t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_INTERVAL_LABEL');
                }
                return result;
            }),
            intervalTimeTypes: computed(() => [
                { label: i18n.t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_INTERVAL_SECOND'), name: 'seconds', type: 'item' },
                { label: i18n.t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_INTERVAL_MINUTE'), name: 'minutes', type: 'item' },
                { label: i18n.t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_INTERVAL_HOUR'), name: 'hours', type: 'item' },
            ]),
            isAllHours: computed(() => size(formState.selectedHours) === 24),
            sizeof: computed(() => size(formState.selectedHours)),
        });
        const validationState = reactive({
            showValidation: false,
            isValid: computed(() => {
                if (formState.scheduleType === 'hourly') {
                    return size(formState.selectedHours) !== 0;
                }
                if (formState.intervalTimeInSeconds) {
                    return formState.intervalTimeInSeconds >= INTERVAL_MIN_SECONDS && formState.intervalTimeInSeconds <= INTERVAL_MAX_SECONDS;
                }
                return false;
            }),
            invalidText: computed(() => {
                if (formState.scheduleType === 'hourly' && size(formState.selectedHours) === 0) {
                    return i18n.t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_HOURLY_INVALID_REQUIRED');
                } if (formState.scheduleType === 'interval') {
                    if (!formState.intervalTimeInSeconds) {
                        return i18n.t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_INTERVAL_INVALID_REQUIRED');
                    } if (formState.intervalTimeInSeconds < INTERVAL_MIN_SECONDS) {
                        return i18n.t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_INTERVAL_INVALID_MIN');
                    } if (formState.intervalTimeInSeconds > INTERVAL_MAX_SECONDS) {
                        return i18n.t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_INTERVAL_INVALID_MAX');
                    }
                }
                return '';
            }),
        });

        const initSelectedHours = () => {
            const res = {};
            get(state, 'schedule.schedule.hours', []).forEach((hour) => {
                let time = dayjs().utc().hour(hour);
                if (formState.timezone !== 'UTC') time = time.tz(formState.timezone);
                res[time.hour()] = time;
            });
            formState.selectedHours = res;
        };
        initSelectedHours();

        const changeTimezone = () => {
            const res = {};
            forEach(formState.selectedHours, (day) => {
                let time = day.utc();
                if (formState.timezone !== 'UTC') time = day.tz(formState.timezone);
                res[time.hour()] = time;
            });
            formState.selectedHours = { ...res };
        };

        const getSchedule = async (): Promise<void> => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.inventory.collector.schedule.get({
                    // eslint-disable-next-line camelcase
                    schedule_id: props.scheduleId,
                    collector_id: props.collectorId,
                });
                state.schedule = res;
                formState.name = res.name;
                if (res.schedule.hours.length > 0) {
                    formState.scheduleType = 'hourly';
                    initSelectedHours();
                } else {
                    formState.scheduleType = 'interval';
                    const interval = res.schedule.interval;

                    formState.intervalTimeType = 'seconds';
                    formState.intervalTime = interval;
                    if (interval >= 60 && interval < 3600 && interval % 60 === 0) {
                        formState.intervalTimeType = 'minutes';
                        formState.intervalTime = Math.trunc(interval / 60);
                    } else if (interval === 3600) {
                        formState.intervalTimeType = 'hours';
                        formState.intervalTime = Math.trunc(interval / 3600);
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };
        const addSchedule = async () => {
            try {
                const params: ScheduleAddParameter = {
                    // eslint-disable-next-line camelcase
                    collector_id: props.collectorId,
                    name: formState.name,
                    schedule: {},
                };
                if (formState.scheduleType === 'hourly') params.schedule = { hours: formState.selectedUTCHoursList };
                else params.schedule = { interval: formState.intervalTimeInSeconds };

                await SpaceConnector.client.inventory.collector.schedule.add(params);

                emit('success');
                showSuccessMessage(i18n.t('PLUGIN.COLLECTOR.MAIN.ALT_S_ADD_SCHEDULE_TITLE'), '', vm.$root);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('PLUGIN.COLLECTOR.MAIN.ALT_E_ADD_SCHEDULE_TITLE'), e, vm.$root);
            }
        };
        const updateSchedule = async () => {
            try {
                const params: ScheduleUpdateParameter = {
                    schedule_id: props.scheduleId,
                    collector_id: props.collectorId,
                    name: formState.name,
                    schedule: {},
                };
                if (formState.scheduleType === 'hourly') {
                    params.schedule = { hours: formState.selectedUTCHoursList };
                } else {
                    params.schedule = { interval: formState.intervalTimeInSeconds };
                }

                await SpaceConnector.client.inventory.collector.schedule.update(params);

                emit('success');
                showSuccessMessage(i18n.t('PLUGIN.COLLECTOR.MAIN.ALT_S_UPDATE_SCHEDULE_TITLE'), '', vm.$root);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('PLUGIN.COLLECTOR.MAIN.ALT_E_UPDATE_SCHEDULE_TITLE'), e, vm.$root);
            }
        };

        const onClickEditConfirm = async () => {
            validationState.showValidation = true;
            if (!validationState.isValid) return;

            state.loading = true;
            if (props.editMode) await updateSchedule();
            else await addSchedule();
            state.loading = false;
            state.proxyVisible = false;
        };
        const onClickHour = (hour) => {
            if (formState.selectedHours[hour]) {
                delete formState.selectedHours[hour];
            } else {
                let time = dayjs().utc().hour(hour);
                if (formState.timezone !== 'UTC') time = dayjs().tz(formState.timezone).hour(hour);
                formState.selectedHours[hour] = time;
            }
            formState.selectedHours = { ...formState.selectedHours };
        };
        const onClickAllHours = () => {
            if (state.isAllHours) formState.selectedHours = {};
            else {
                state.hoursMatrix.forEach((hour) => {
                    let time = dayjs().utc().hour(hour);
                    if (formState.timezone !== 'UTC') time = dayjs().tz(formState.timezone).hour(hour);
                    formState.selectedHours[hour] = time;
                });
                formState.selectedHours = { ...formState.selectedHours };
            }
        };

        watch([() => props.collectorId, () => props.scheduleId],
            async ([collectorId, scheduleId]) => {
                if (props.editMode && collectorId && scheduleId) await getSchedule();
            }, { immediate: true });

        return {
            ...toRefs(state),
            formState,
            validationState,
            onClickHour,
            onClickAllHours,
            onClickEditConfirm,
            changeTimezone,
        };
    },
};
</script>

<style lang="postcss" scoped>
.edit-schedule-modal-container {
    .modal-content .modal-body-container.scrollable {
        min-height: 34rem;
    }

    .name, .timezone {
        width: 60%;
    }

    .p-field-group {
        .label-help-text {
            @apply text-gray-400;
            font-size: 0.75rem;
            margin-left: 0.5rem;
        }
    }

    .time-schedule-wrapper {
        @apply border border-gray-200;
        cursor: pointer;
        border-bottom-left-radius: 0.25rem;
        border-bottom-right-radius: 0.25rem;
        padding: 1.5rem;
        &:first-of-type {
            border-radius: 0.25rem 0.25rem 0 0;
        }
        &:hover {
            @apply bg-secondary2;
        }
        &.selected {
            @apply border-blue-500;
            &:hover {
                @apply bg-white;
                cursor: default;
            }
        }

        .schedule-type-text {
            font-weight: bold;
            font-size: 0.75rem;
            padding-left: 0.5rem;
        }
        .hourly-schedule-wrapper {
            display: grid;
            gap: 0.5rem;
            grid-template-columns: repeat(12, 2rem);
            grid-template-rows: auto;

            .time-block {
                @apply bg-white border border-gray-300 rounded-sm;
                display: inline-block;
                height: 2rem;
                line-height: 2rem;
                text-align: center;
                font-size: 0.875rem;
                cursor: pointer;
                &:hover {
                    @apply bg-secondary2 border-secondary text-secondary;
                }
                &.active {
                    @apply bg-safe text-white;
                }
            }
            .all-button {
                @apply bg-white text-black border-gray-300;
                margin-right: 0.5rem;
                margin-bottom: 0.5rem;
                vertical-align: unset;
                &:hover {
                    @apply bg-secondary2 border-secondary text-secondary;
                }
                &.all-selected {
                    @apply bg-gray-900 text-white;
                    border: none;
                }
            }
        }
        .interval-wrapper {
            display: inline-flex;
            width: 100%;
            .p-field-group::v-deep .form-label {
                display: inline-flex;
            }
            .p-select-dropdown {
                @apply bg-white;
                margin-left: 1rem;
            }
        }
    }
}
</style>
