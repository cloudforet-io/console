<script lang="ts" setup>

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFilterableDropdown, PFieldGroup, PRadio, PButton, PTextInput, PI, PSelectDropdown,
} from '@spaceone/design-system';
import type { FilterableDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/filterable-dropdown/type';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
    range, get, forEach, size, map,
} from 'lodash';
import {
    reactive, computed, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { timezoneList } from '@/store/modules/user/config';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';


interface ScheduleHours {
    [time: string]: Dayjs;
}

interface ScheduleType {
    hourly: string | TranslateResult;
    interval?: string | TranslateResult;
}

const INTERVAL_MAX_SECONDS = 3600;
const INTERVAL_MIN_SECONDS = 30;

interface Props {
    visible: boolean;
    collectorId: string;
    scheduleId: string;
    editMode: boolean;
    supportedSchedules: string[];
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    collectorId: '',
    scheduleId: '',
    editMode: true,
    supportedSchedules: () => [],
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'success'): void;
}>();
const store = useStore();
const { t } = useI18n();

const formState = reactive({
    name: '',
    timezone: ([{
        type: 'item',
        label: store.state.user.timezone === 'UTC' ? `${store.state.user.timezone} (default)` : store.state.user.timezone,
        name: store.state.user.timezone,
    }] || [{ type: 'item', label: 'UTC', name: 'UTC' }]) as FilterableDropdownMenuItem[],
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
    proxyVisible: useProxyValue('visible', props, emit),
    //
    hoursMatrix: range(24),
    timezones: map(timezoneList, (d) => ({
        type: 'item', label: d === 'UTC' ? `${d} (default)` : d, name: d,
    })) as FilterableDropdownMenuItem[],
    scheduleTypes: computed(() => {
        const result: ScheduleType = {
            hourly: t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_HOURLY_LABEL'),
        };
        if (props.supportedSchedules && props.supportedSchedules.includes('interval')) {
            result.interval = t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_INTERVAL_LABEL');
        }
        return result;
    }),
    intervalTimeTypes: computed(() => [
        { label: t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_INTERVAL_SECOND'), name: 'seconds', type: 'item' },
        { label: t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_INTERVAL_MINUTE'), name: 'minutes', type: 'item' },
        { label: t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_INTERVAL_HOUR'), name: 'hours', type: 'item' },
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
            return t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_HOURLY_INVALID_REQUIRED');
        } if (formState.scheduleType === 'interval') {
            if (!formState.intervalTimeInSeconds) {
                return t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_INTERVAL_INVALID_REQUIRED');
            } if (formState.intervalTimeInSeconds < INTERVAL_MIN_SECONDS) {
                return t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_INTERVAL_INVALID_MIN');
            } if (formState.intervalTimeInSeconds > INTERVAL_MAX_SECONDS) {
                return t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_INTERVAL_INVALID_MAX');
            }
        }
        return '';
    }),
});

const initSelectedHours = () => {
    const res = {};
    get(state, 'schedule.schedule.hours', []).forEach((hour) => {
        let time = dayjs().utc().hour(hour);
        if (formState.timezone?.[0]?.name !== 'UTC') time = time.tz(formState.timezone?.[0]?.name);
        res[time.hour()] = time;
    });
    formState.selectedHours = res;
};
initSelectedHours();

const changeTimezone = () => {
    const res = {};
    forEach(formState.selectedHours, (day) => {
        let time = day.utc();
        if (formState.timezone?.[0]?.name !== 'UTC') time = day.tz(formState.timezone?.[0]?.name);
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
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};
const addSchedule = async () => {
    try {
        const params: any = {
            // eslint-disable-next-line camelcase
            collector_id: props.collectorId,
            name: formState.name,
            schedule: {},
        };
        if (formState.scheduleType === 'hourly') params.schedule = { hours: formState.selectedUTCHoursList };
        else params.schedule = { interval: formState.intervalTimeInSeconds };

        await SpaceConnector.client.inventory.collector.schedule.add(params);

        emit('success');
        showSuccessMessage(t('PLUGIN.COLLECTOR.MAIN.ALT_S_ADD_SCHEDULE_TITLE'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PLUGIN.COLLECTOR.MAIN.ALT_E_ADD_SCHEDULE_TITLE'));
    }
};
const updateSchedule = async () => {
    try {
        const params: any = {
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
        showSuccessMessage(t('PLUGIN.COLLECTOR.MAIN.ALT_S_UPDATE_SCHEDULE_TITLE'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PLUGIN.COLLECTOR.MAIN.ALT_E_UPDATE_SCHEDULE_TITLE'));
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
        if (formState.timezone?.[0]?.name !== 'UTC') time = dayjs().tz(formState.timezone?.[0]?.name).hour(hour);
        formState.selectedHours[hour] = time;
    }
    formState.selectedHours = { ...formState.selectedHours };
};
const onClickAllHours = () => {
    if (state.isAllHours) formState.selectedHours = {};
    else {
        state.hoursMatrix.forEach((hour) => {
            let time = dayjs().utc().hour(hour);
            if (formState.timezone?.[0]?.name !== 'UTC') time = dayjs().tz(formState.timezone?.[0]?.name).hour(hour);
            formState.selectedHours[hour] = time;
        });
        formState.selectedHours = { ...formState.selectedHours };
    }
};

watch(
    [() => props.collectorId, () => props.scheduleId],
    async ([collectorId, scheduleId]) => {
        if (props.editMode && collectorId && scheduleId) await getSchedule();
    },
    { immediate: true },
);

</script>

<template>
    <p-button-modal
        v-model:visible="state.proxyVisible"
        class="edit-schedule-modal-container"
        :header-title="editMode ? t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TITLE_UPDATE') : t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TITLE_ADD')"
        centered
        fade
        backdrop
        size="md"
        :loading="state.loading"
        @confirm="onClickEditConfirm"
    >
        <template #body>
            <p-field-group :label="t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_NAME_LABEL')">
                <p-text-input v-model="formState.name"
                              class="name"
                              :placeholder="t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_NAME_PLACEHOLDER')"
                />
            </p-field-group>
            <p-field-group :label="$t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIMEZONE_LABEL')"
                           required
            >
                <p-filterable-dropdown v-model:selected="formState.timezone"
                                       :menu="state.timezones"
                                       class="timezone"
                                       use-fixed-menu-style
                                       disabled
                                       @update:selected="changeTimezone"
                />
            </p-field-group>
            <p-field-group :label="t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_LABEL')"
                           required
                           :invalid="validationState.showValidation && !validationState.isValid"
                           :invalid-text="validationState.invalidText"
            >
                <template #label-extra>
                    <span class="label-help-text">{{ t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_DESC',
                                                       { timezone: (formState.timezone && formState.timezone[0]) ? formState.timezone[0].label : '' }) }}</span>
                </template>
                <div v-for="(type, idx) in Object.keys(state.scheduleTypes)"
                     :key="idx"
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
                                <p-i class="radio-icon"
                                     width="1.25rem"
                                     height="1.25rem"
                                     :name="formState.scheduleType === type ? 'ic_checkbox-circle-selected' : 'ic_radio'"
                                />
                            </template>
                        </p-radio>
                        <span class="schedule-type-text">
                            {{ state.scheduleTypes[type] }}
                        </span>
                    </div>
                    <div class="w-full lg:w-2/3 m-auto">
                        <div v-if="type === 'hourly'"
                             class="hourly-schedule-wrapper"
                        >
                            <span v-for="(hour) in state.hoursMatrix"
                                  :key="hour"
                                  class="time-block"
                                  :class="{active: formState.selectedHours[hour] }"
                                  @click="onClickHour(hour)"
                            >
                                {{ hour }}
                            </span>
                            <p-button class="all-button"
                                      :class="[state.isAllHours ? 'all-selected' : '']"
                                      style-type="highlight"
                                      @click="onClickAllHours"
                            >
                                {{ t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_ALL') }}
                            </p-button>
                        </div>
                        <div v-else
                             class="interval-wrapper"
                        >
                            <p-field-group :label="t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_EDIT_MODAL_TIME_EVERY_LABEL')"
                                           required
                                           class="w-full flex"
                            >
                                <div class="ml-4 flex-grow inline-flex">
                                    <p-text-input v-model="formState.intervalTime"
                                                  class="w-1/2"
                                                  type="number"
                                    />
                                    <p-select-dropdown v-model="formState.intervalTimeType"
                                                       class="w-1/2"
                                                       :items="state.intervalTimeTypes"
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
            @apply rounded-tl-md rounded-tr-md;
        }
        &:hover {
            @apply bg-secondary2;
        }
        &.selected {
            @apply border-blue-600;
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
                @apply bg-white border border-gray-300 rounded-xs;
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

            /* custom design-system component - p-field-group */
            :deep(.p-field-group) .form-label {
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
