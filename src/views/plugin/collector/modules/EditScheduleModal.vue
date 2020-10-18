<template>
    <p-button-modal
        class="edit-schedule-modal-container"
        :header-title="editMode ? $t('INVENTORY.UPT_SCHEDULE') : $t('INVENTORY.ADD_SCHEDULE')"
        centered
        fade
        backdrop
        size="lg"
        :loading="loading"
        :visible.sync="proxyVisible"
        @confirm="onClickEditConfirm"
    >
        <template #body>
            <p-field-group :label="$t('COMMON.NAME')">
                <br>
                <p-text-input v-model="name" class="name" placeholder="Schedule Name" />
            </p-field-group>
            <p-field-group :label="$t('COMMON.TIMEZONE')">
                <p-select-dropdown v-model="timezone" :items="timezones"
                                   class="timezone"
                                   @input="changeTimezone"
                />
            </p-field-group>
            <p-field-group :label="$t('COMMON.TIME_SCHEDULE')"
                           required
                           :invalid="showValidation && !isValid"
                           :invalid-text="invalidText"
            >
                <span class="label-help-text">Select Hourly or Interval.</span>
                <div v-for="(type, idx) in Object.keys(scheduleTypes)" :key="idx"
                     class="schedule-lap block lg:flex h-48 lg:h-40"
                     :class="scheduleType === type ? 'selected' : ''"
                     @click="scheduleType = type"
                >
                    <div class="w-full lg:w-1/3 pb-4 lg:pb-0">
                        <p-radio
                            v-model="scheduleType"
                            :value="type"
                        >
                            <template #icon>
                                <p-i class="radio-icon" width="1.25rem" height="1.25rem"
                                     :name="scheduleType === type ? 'ic_checkbox_circle--checked' : 'ic_radio'"
                                />
                            </template>
                        </p-radio>
                        <span class="schedule-type-text">
                            {{ scheduleTypes[type] }}
                        </span>
                    </div>
                    <div class="w-full lg:w-2/3 m-auto">
                        <div v-if="type === 'hourly'" class="hourly-schedule-lap">
                            <span v-for="(hour) in hoursMatrix" :key="hour"
                                  class="time-block"
                                  :class="{active: selectedHours[hour] }"
                                  @click="onClickHour(hour)"
                            >
                                {{ hour }}
                            </span>
                            <p-button class="all-button"
                                      :class="[isAllHours ? 'all-selected' : '']"
                                      style-type="secondary"
                                      @click="onClickAllHours"
                            >
                                {{ $t('COMMON.ALL') }}
                            </p-button>
                        </div>
                        <div v-else class="interval-lap">
                            <p-field-group label="Every" class="w-1/2">
                                <p-text-input v-model="intervalTime" type="number" placeholder="Time" />
                            </p-field-group>
                            <div class="w-1/2">
                                <p-select-dropdown v-model="intervalTimeType" :items="intervalTimeTypes" auto-height />
                            </div>
                        </div>
                    </div>
                </div>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    range, flatMap, get, forEach,
} from 'lodash';
import moment from 'moment';

import {
    reactive, toRefs, computed, watch, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/PFieldGroup.vue';
import PRadio from '@/components/molecules/forms/radio/PRadio.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import PI from '@/components/atoms/icons/PI.vue';

import { ScheduleAddParameter, ScheduleUpdateParameter } from '@/lib/fluent-api/inventory/collector.type';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { SpaceConnector } from '@/lib/space-connector';
import { makeProxy } from '@/lib/compostion-util';
import { store } from '@/store';

class MenuItem {
    name: string;

    label: string;

    type: string;

    constructor(name, label?) {
        this.name = name;
        this.label = label || name;
        this.type = 'item';
    }
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
    },
    setup(props, { emit, root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: false,
            schedule: null,
            proxyVisible: makeProxy('visible', props, emit),
            name: '',
            timezone: store.state.user.timezone || 'UTC',
            hoursMatrix: range(24),
            selectedHours: {},
            selectedUTCHoursList: computed(() => flatMap(state.selectedHours, time => moment.utc(time).hour())),
            isAllHours: computed(() => state.selectedUTCHoursList.length === 24),
            showValidation: false,
            invalidText: computed(() => {
                if (state.scheduleType === 'hourly' && state.selectedUTCHoursList.length === 0) {
                    return 'Please select time';
                } if (state.scheduleType === 'interval') {
                    if (!state.intervalTimeInSeconds) {
                        return 'Please enter interval time';
                    } if (state.intervalTimeInSeconds < INTERVAL_MIN_SECONDS) {
                        return 'Should be at least 30 seconds';
                    } if (state.intervalTimeInSeconds > INTERVAL_MAX_SECONDS) {
                        return 'Should be less than 1 hour';
                    }
                }
                return '';
            }),
            isValid: computed(() => {
                if (state.scheduleType === 'hourly') return state.selectedUTCHoursList.length !== 0;
                return state.intervalTimeInSeconds >= INTERVAL_MIN_SECONDS && state.intervalTimeInSeconds <= INTERVAL_MAX_SECONDS;
            }),
            //
            scheduleTypes: { hourly: vm.$t('COMMON.HOURLY'), interval: vm.$t('COMMON.INTERVAL') },
            scheduleType: 'hourly',
            intervalTime: undefined as undefined | number,
            intervalTimeInSeconds: computed(() => {
                if (state.intervalTimeType === 'minutes') return state.intervalTime * 60;
                if (state.intervalTimeType === 'hours') return state.intervalTime * 3600;
                return state.intervalTime;
            }),
            intervalTimeTypes: [
                { label: 'seconds', name: 'seconds', type: 'item' },
                { label: 'minutes', name: 'minutes', type: 'item' },
                { label: 'hour', name: 'hours', type: 'item' },
            ],
            intervalTimeType: 'minutes',
        });

        const timezones = state.timezone === 'UTC'
            ? [new MenuItem(state.timezone)] : [
                new MenuItem(state.timezone),
                new MenuItem('UTC'),
            ];

        const initSelectedHours = () => {
            const res = {};
            get(state, 'schedule.schedule.hours', []).forEach((hour) => {
                const time = moment.tz(moment.utc({ hour }), state.timezone);
                res[time.hour()] = time;
            });
            state.selectedHours = res;
        };
        initSelectedHours();

        const changeTimezone = () => {
            const res = {};
            forEach(state.selectedHours, (time) => {
                const newTime = moment.tz(time, state.timezone);
                res[newTime.hour()] = newTime;
            });
            state.selectedHours = res;
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
                state.name = res.name;
                if (res.schedule.hours.length > 0) {
                    state.scheduleType = 'hourly';
                    initSelectedHours();
                } else {
                    state.scheduleType = 'interval';
                    const interval = res.schedule.interval;

                    state.intervalTimeType = 'seconds';
                    state.intervalTime = interval;
                    if (interval >= 60 && interval < 3600 && interval % 60 === 0) {
                        state.intervalTimeType = 'minutes';
                        state.intervalTime = Math.trunc(interval / 60);
                    } else if (interval === 3600) {
                        state.intervalTimeType = 'hours';
                        state.intervalTime = Math.trunc(interval / 3600);
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
                    name: state.name,
                    schedule: {},
                };
                if (state.scheduleType === 'hourly') params.schedule = { hours: state.selectedUTCHoursList };
                else params.schedule = { interval: state.intervalTimeInSeconds };

                await SpaceConnector.client.inventory.collector.schedule.add(params);

                emit('success');
                showSuccessMessage('Success', 'Add Schedule', root);
            } catch (e) {
                console.error(e);
                showErrorMessage('Fail to Add Schedule', e, root);
            }
        };
        const updateSchedule = async () => {
            try {
                const params: ScheduleUpdateParameter = {
                    // eslint-disable-next-line camelcase
                    schedule_id: props.scheduleId,
                    // eslint-disable-next-line camelcase
                    collector_id: props.collectorId,
                    name: state.name,
                    schedule: {},
                };
                if (state.scheduleType === 'hourly') params.schedule = { hours: state.selectedUTCHoursList };
                else params.schedule = { interval: state.intervalTimeInSeconds };

                await SpaceConnector.client.inventory.collector.schedule.update(params);

                emit('success');
                showSuccessMessage('Success', 'Updated Schedule', root);
            } catch (e) {
                console.error(e);
                showErrorMessage('Fail to Update Schedule', e, root);
            }
        };

        const onClickEditConfirm = async () => {
            state.showValidation = true;
            if (!state.isValid) return;

            state.loading = true;
            if (props.editMode) await updateSchedule();
            else await addSchedule();
            state.loading = false;
            state.proxyVisible = false;
        };
        const onClickHour = (hour) => {
            if (state.selectedHours[hour]) delete state.selectedHours[hour];
            else state.selectedHours[hour] = moment.tz({ hour }, state.timezone);
            state.selectedHours = { ...state.selectedHours };
        };
        const onClickAllHours = () => {
            if (state.isAllHours) state.selectedHours = {};
            else {
                state.hoursMatrix.forEach((hour) => {
                    state.selectedHours[hour] = moment.tz({ hour }, state.timezone);
                });
                state.selectedHours = { ...state.selectedHours };
            }
        };

        watch([() => props.collectorId, () => props.scheduleId],
            async ([collectorId, scheduleId]) => {
                if (props.editMode && collectorId && scheduleId) await getSchedule();
            }, { immediate: true });

        return {
            ...toRefs(state),
            timezones,
            changeTimezone,
            onClickHour,
            onClickAllHours,
            onClickEditConfirm,
        };
    },
};
</script>

<style lang="postcss">
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

    .schedule-lap {
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
        .hourly-schedule-lap {
            display: grid;
            gap: 0.5rem;
            grid-template-columns: repeat(12, 2rem);
            grid-template-rows: auto;

            .time-block {
                @apply bg-white border border-gray-300;
                display: inline-block;
                height: 2rem;
                line-height: 2rem;
                text-align: center;
                border-radius: 2px;
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
        .interval-lap {
            display: inline-flex;
            width: 100%;
            .form-label {
                font-weight: normal;
            }
            .p-text-input {
                @apply w-4/5;
            }
            .p-select-dropdown {
                @apply bg-white;
                margin-left: 1rem;
            }
        }
    }
}
</style>
