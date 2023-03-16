<template>
    <p-button-modal :header-title="editMode ?
                        $t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.FORM.UPDATE_TITLE')
                        : $t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.FORM.CREATE_TITLE')"
                    :visible.sync="proxyVisible"
                    :loading="loading"
                    :disabled="showValidation && (!!titleInvalidText || isTimePeriodInvalid)"
                    @confirm="handleClickConfirm"
    >
        <template #body>
            <p class="form-desc">
                {{ $t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.FORM.DESC') }}
            </p>
            <p-field-group :label="$t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.FORM.LABEL_TITLE')"
                           required
                           :invalid="showValidation && !!titleInvalidText"
                           :invalid-text="titleInvalidText"
            >
                <p-text-input v-model="title"
                              class="w-full"
                              :invalid="showValidation && !!titleInvalidText"
                              block
                              @update:value.once="handleFirstInputTitle"
                />
            </p-field-group>
            <p-field-group class="schedule-field"
                           :label="$t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.FORM.LABEL_SCHEDULE')"
                           required
                           :invalid="showValidation && isTimePeriodInvalid"
                           :invalid-text="$t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.FORM.INVALID_TEXT')"
            >
                <p-radio v-for="{name, label} in scheduleRadioItems"
                         :key="name"
                         v-model="selectedScheduleType"
                         :value="name"
                         class="schedule-type-radio"
                >
                    {{ label }}
                </p-radio>
                <div class="time-selection-wrapper"
                     :class="{'invalid':showValidation && isTimePeriodInvalid}"
                >
                    <template v-if="selectedScheduleType === SCHEDULE_TYPE.startNow">
                        <p-select-button v-for="{name, label} in durationItems"
                                         :key="name"
                                         v-model="selectedDuration"
                                         :value="name"
                                         class="mr-2"
                        >
                            {{ label }}
                        </p-select-button>
                    </template>
                    <table v-else>
                        <tbody>
                            <tr>
                                <td>
                                    <label>{{ $t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.FORM.LABEL_TIMEZONE') }}</label>
                                </td>
                                <td>{{ timezone }}</td>
                            </tr>
                            <tr>
                                <td>
                                    <label for="start-time">{{ $t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.FORM.LABEL_START_TIME') }}</label>
                                </td>
                                <td class="time-selection-group">
                                    <input id="start-time"
                                           v-model="startTimeInput"
                                           type="datetime-local"
                                           @change="handleChangeStartTime"
                                    >
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label for="end-time">{{ $t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.FORM.LABEL_END_TIME') }}</label>
                                </td>
                                <td class="time-selection-group">
                                    <input id="end-time"
                                           v-model="endTimeInput"
                                           type="datetime-local"
                                           :min="startTimeInput"
                                    >
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </p-field-group>
            <p-field-group class="period-field"
                           :label="$t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.FORM.LABEL_TIME_PERIOD')"
                           required
            >
                <span v-if="selectedScheduleType === SCHEDULE_TYPE.startNow">
                    {{ timePeriod }}
                </span>
                <span v-else>
                    {{ isTimePeriodInvalid ? '--' : timePeriodFormatter(startTimeInput, endTimeInput) }}
                </span>
            </p-field-group>
        </template>
        <template v-if="editMode"
                  #footer-extra
        >
            <p-button style-type="negative-secondary"
                      size="lg"
                      @click="handleClickClose(maintenanceWindowId)"
            >
                {{ $t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.CLOSE_NOW') }}
            </p-button>
        </template>
    </p-button-modal>
</template>

<script lang="ts">

import type { SetupContext } from 'vue';
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import {
    PButton, PButtonModal, PFieldGroup, PRadio, PSelectButton, PTextInput,
} from '@spaceone/design-system';
import dayjs from 'dayjs';

import { iso8601Formatter } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useProjectDetailPageStore } from '@/services/project/store/project-detail-page-store';

const SCHEDULE_TYPE = Object.freeze({
    startNow: 'startNow',
    startAtTime: 'startAtTime',
});

const DURATION = Object.freeze({
    m15: 'm15',
    m30: 'm30',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
});

const DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm';

interface MaintenanceWindow {
    maintenance_window_id: string;
    title: string;
    start_time: string;
    end_time: string;
    projects: string[];
}

export default {
    name: 'MaintenanceWindowFormModal',
    components: {
        PButtonModal,
        PFieldGroup,
        PRadio,
        PTextInput,
        PSelectButton,
        PButton,
    },
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
        editMode: {
            type: Boolean,
            default: false,
        },
        projectId: {
            type: String,
            default: undefined,
        },
        maintenanceWindowId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }: SetupContext) {
        const projectDetailPageStore = useProjectDetailPageStore();
        const state = reactive({
            proxyVisible: useProxyValue('visible', props, emit),
            loading: false,
            title: '',
            titleInvalidText: computed(() => {
                if (state.title?.length === 0) return i18n.t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.FORM.REQUIRED');
                return undefined;
            }),
            isTimePeriodInvalid: computed(() => {
                // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                if (props.editMode) state.showValidation = true;
                if (state.selectedScheduleType === SCHEDULE_TYPE.startNow) return false;

                const timeDiff = dayjs(state.startTimeInput).diff(state.endTimeInput, 'minute');
                // eslint-disable-next-line no-restricted-globals
                if (timeDiff >= 0 || isNaN(timeDiff)) return true;

                if (dayjs().isAfter(dayjs(state.endTimeInput))) return true;
                return false;
            }),
            scheduleRadioItems: computed(() => {
                const items = [
                    { name: SCHEDULE_TYPE.startNow, label: i18n.t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.FORM.START_NOW') },
                    { name: SCHEDULE_TYPE.startAtTime, label: i18n.t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.FORM.START_AT_TIME') },
                ];
                if (props.editMode) items.splice(0, 1);
                return items;
            }),
            selectedScheduleType: SCHEDULE_TYPE.startNow,
            durationItems: computed(() => [
                { name: DURATION.m15, label: `15 ${i18n.t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.FORM.MINUTES')}` },
                { name: DURATION.m30, label: `30 ${i18n.t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.FORM.MINUTES')}` },
                { name: DURATION.h1, label: `1 ${i18n.t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.FORM.HOURS')}` },
                { name: DURATION.h2, label: `2 ${i18n.t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.FORM.HOURS')}` },
                { name: DURATION.h3, label: `3 ${i18n.t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.FORM.HOURS')}` },
            ]),
            selectedDuration: DURATION.m15,
            timezone: computed(() => store.state.user.timezone),
            startTimeInput: dayjs().format(DATE_TIME_FORMAT),
            endTimeInput: dayjs().add(1, 'hour').format(DATE_TIME_FORMAT),
            showValidation: false,
            timePeriod: computed(() => state.durationItems.find((d) => d.name === state.selectedDuration)?.label),
        });

        /* Local Variables */
        let originMaintenanceWindow: Partial<MaintenanceWindow> = {};

        /* Helpers */
        const checkTimes = () => {
            if (state.selectedScheduleType === SCHEDULE_TYPE.startNow) {
                const time = Number(state.selectedDuration.slice(1));
                const unit = state.selectedDuration.slice(0, 1) as 'm'|'h';
                state.endTimeInput = dayjs(state.startTimeInput).add(time, unit).format(DATE_TIME_FORMAT);
            }
        };

        const getTimeParams = () => ({
            start_time: dayjs.tz(state.startTimeInput, state.timezone).utc().toISOString(),
            end_time: dayjs.tz(state.endTimeInput, state.timezone).utc().toISOString(),
        });

        const timePeriodFormatter = (startTimeInput, endTimeInput) => {
            const startTime = iso8601Formatter(startTimeInput, 'UTC');
            const endTime = iso8601Formatter(endTimeInput, 'UTC');
            const timeDiff = dayjs(endTime).diff(startTime, 'minute');
            const days = Math.floor(timeDiff / 1440);
            const hours = Math.floor((timeDiff % 1440) / 60);
            const minutes = Math.floor((timeDiff % 60) % 60);

            const timePeriod = () => {
                let period = '';
                if (days !== 0) period = `${days} ${i18n.t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.FORM.DAYS')}`;
                if (hours !== 0) period += ` ${hours} ${i18n.t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.FORM.HOURS')}`;
                if (minutes !== 0) period += ` ${minutes} ${i18n.t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.FORM.MINUTES')}`;
                return period;
            };
            return timePeriod();
        };

        /* API calls */
        const getMaintenanceWindow = async () => {
            try {
                return await SpaceConnector.client.monitoring.maintenanceWindow.get({
                    maintenance_window_id: props.maintenanceWindowId,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
                return {};
            }
        };

        const createMaintenanceWindow = async () => {
            try {
                const res = await SpaceConnector.client.monitoring.maintenanceWindow.create({
                    title: state.title,
                    projects: [props.projectId],
                    ...getTimeParams(),
                });

                showSuccessMessage(i18n.t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.ALT_S_CREATE_MAINTENANCE_WINDOW'), '');
                return res.maintenance_window_id;
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.ALT_E_CREATE_MAINTENANCE_WINDOW'));
                throw e;
            }
        };

        const updateMaintenanceWindow = async () => {
            try {
                const res = await SpaceConnector.client.monitoring.maintenanceWindow.update({
                    // eslint-disable-next-line camelcase
                    maintenance_window_id: props.maintenanceWindowId,
                    title: state.title,
                    projects: originMaintenanceWindow.projects,
                    ...getTimeParams(),
                });

                showSuccessMessage(i18n.t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.ALT_S_UPDATE_MAINTENANCE_WINDOW'), '');
                return res.maintenance_window_id;
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.ALT_E_UPDATE_MAINTENANCE_WINDOW'));
                throw e;
            }
        };

        /* Handlers */
        const handleFirstInputTitle = (e) => {
            state.showValidation = true;
            state.title = e.target?.value ?? '';
        };

        const handleChangeStartTime = (e) => {
            const start = dayjs(e.target.value);
            if (start.isAfter(dayjs(state.endTimeInput))) {
                state.endTimeInput = start.add(1, 'hour').format(DATE_TIME_FORMAT);
            }
        };

        const handleClickConfirm = async () => {
            if (!state.showValidation) state.showValidation = true;

            if (state.titleInvalidText) return;
            if (state.isTimePeriodInvalid) return;

            state.loading = true;

            try {
                checkTimes();
                getTimeParams();

                let maintenanceWindowId;
                if (props.editMode) maintenanceWindowId = await updateMaintenanceWindow();
                else maintenanceWindowId = await createMaintenanceWindow();

                state.proxyVisible = false;
                emit('confirm', maintenanceWindowId);
                await projectDetailPageStore.loadMaintenanceHappenings();
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        };

        const handleClickClose = (maintenanceWindowId) => {
            emit('close', maintenanceWindowId);
            state.proxyVisible = false;
        };

        /* Initiators */
        const reset = async () => {
            state.showValidation = false;

            state.loading = true;

            if (props.editMode) {
                originMaintenanceWindow = await getMaintenanceWindow();
                state.selectedScheduleType = SCHEDULE_TYPE.startAtTime;
            } else {
                originMaintenanceWindow = {};
                state.selectedScheduleType = SCHEDULE_TYPE.startNow;
            }

            state.title = originMaintenanceWindow.title || '';
            state.selectedDuration = DURATION.m15;
            const current = dayjs.utc().tz(state.timezone);
            const startTime = originMaintenanceWindow.start_time;
            const endTime = originMaintenanceWindow.end_time;
            state.startTimeInput = startTime ? dayjs.tz(dayjs.utc(startTime), state.timezone).format(DATE_TIME_FORMAT) : current.format(DATE_TIME_FORMAT);
            state.endTimeInput = endTime ? dayjs.tz(dayjs.utc(endTime), state.timezone).format(DATE_TIME_FORMAT) : current.add(1, 'hour').format(DATE_TIME_FORMAT);

            state.loading = false;
        };

        watch(() => props.visible, async (visible) => {
            if (visible) await reset();
        });

        return {
            ...toRefs(state),
            handleFirstInputTitle,
            handleChangeStartTime,
            handleClickConfirm,
            handleClickClose,
            timePeriodFormatter,
            SCHEDULE_TYPE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.form-desc {
    @apply text-gray-600;
    margin: 1rem 0;
    font-size: 1rem;
    line-height: 1.6;
}
.schedule-field {
    margin-top: 1.125rem;
}
.schedule-type-radio {
    display: inline-block;
    margin-right: 1.125rem;
    margin-bottom: 1.25rem;
}
.time-selection-wrapper {
    @apply border border-gray-200 rounded-lg;
    padding: 0.75rem 1rem;
    min-height: 8.5rem;
    &.invalid {
        @apply border-alert;
    }
}
.period-field {
    display: flex;
    align-items: center;
    span {
        display: inline-block;
        margin-bottom: 0.25rem;
        margin-left: 0.5rem;
        font-size: 0.875rem;
        line-height: 1.4;
    }
}
table {
    td {
        line-height: 1.6;
        font-size: 0.875rem;
        padding: 0.25rem 0;
        label {
            @apply text-gray-400;
            margin-right: 0.5rem;
            font-weight: bold;
        }
    }
}
.p-select-dropdown {
    display: inline-block;
    margin-right: 0.5rem;
}
</style>
