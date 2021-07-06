<template>
    <p-button-modal :header-title="editMode ?
                        $t('PROJECT.DETAIL.MAINTENANCE_WINDOW.FORM.UPDATE_TITLE')
                        : $t('PROJECT.DETAIL.MAINTENANCE_WINDOW.FORM.CREATE_TITLE')"
                    :visible.sync="proxyVisible"
                    :loading="loading"
                    :disabled="showValidation && !!titleInvalidText"
                    @confirm="onClickConfirm"
    >
        <template #body>
            <p class="form-desc">
                {{ $t('PROJECT.DETAIL.MAINTENANCE_WINDOW.FORM.DESC') }}
            </p>
            <p-field-group :label="$t('PROJECT.DETAIL.MAINTENANCE_WINDOW.FORM.LABEL_TITLE')" required
                           :invalid="showValidation && !!titleInvalidText"
                           :invalid-text="titleInvalidText"
            >
                <p-text-input v-model="title" class="w-full" :invalid="showValidation && !!titleInvalidText"
                              block @input.once="onFirstInputTitle"
                />
            </p-field-group>
            <p-field-group class="schedule-field" :label="$t('PROJECT.DETAIL.MAINTENANCE_WINDOW.FORM.LABEL_SCHEDULE')"
                           required
            >
                <p-radio v-for="{name, label} in scheduleRadioItems" :key="name" v-model="selectedScheduleType"
                         :value="name"
                         class="schedule-type-radio"
                >
                    {{ label }}
                </p-radio>
                <div class="time-selection-wrapper">
                    <template v-if="selectedScheduleType === SCHEDULE_TYPE.startNow">
                        <p-select-button v-for="{name, label} in durationItems" :key="name" v-model="selectedDuration"
                                         :value="name" class="mr-2"
                        >
                            {{ label }}
                        </p-select-button>
                    </template>
                    <table v-else>
                        <tbody>
                            <tr>
                                <td>
                                    <label>{{ $t('PROJECT.DETAIL.MAINTENANCE_WINDOW.FORM.LABEL_TIMEZONE') }}</label>
                                </td>
                                <td>{{ timezone }}</td>
                            </tr>
                            <tr>
                                <td>
                                    <label for="start-time">{{ $t('PROJECT.DETAIL.MAINTENANCE_WINDOW.FORM.LABEL_START_TIME') }}</label>
                                </td>
                                <td class="time-selection-group">
                                    <input id="start-time" v-model="startTimeInput" type="datetime-local"
                                           :min="minTime" @change="onChangeStartTime"
                                    >
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label for="end-time">{{ $t('PROJECT.DETAIL.MAINTENANCE_WINDOW.FORM.LABEL_END_TIME') }}</label>
                                </td>
                                <td class="time-selection-group">
                                    <input id="end-time" v-model="endTimeInput" type="datetime-local"
                                           :min="startTimeInput"
                                    >
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    PButtonModal, PFieldGroup, PRadio, PSelectButton, PTextInput,
} from '@spaceone/design-system';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import dayjs from 'dayjs';

import { makeProxy } from '@/core-lib/compostion-util';
import { i18n } from '@/translations';
import { store } from '@/store';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@/core-lib/space-connector';

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
    // eslint-disable-next-line camelcase
    start_time: string;
    // eslint-disable-next-line camelcase
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
    setup(props, { emit, root }) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            loading: false,
            title: '',
            titleInvalidText: computed(() => {
                if (state.title?.length === 0) return i18n.t('PROJECT.DETAIL.MAINTENANCE_WINDOW.FORM.REQUIRED');
                return undefined;
            }),
            scheduleRadioItems: computed(() => {
                const items = [
                    { name: SCHEDULE_TYPE.startNow, label: i18n.t('PROJECT.DETAIL.MAINTENANCE_WINDOW.FORM.START_NOW') },
                    { name: SCHEDULE_TYPE.startAtTime, label: i18n.t('PROJECT.DETAIL.MAINTENANCE_WINDOW.FORM.START_AT_TIME') },
                ];
                if (props.editMode) items.splice(0, 1);
                return items;
            }),
            selectedScheduleType: SCHEDULE_TYPE.startNow,
            durationItems: computed(() => [
                { name: DURATION.m15, label: `15 ${i18n.t('PROJECT.DETAIL.MAINTENANCE_WINDOW.FORM.MINUTES')}` },
                { name: DURATION.m30, label: `30 ${i18n.t('PROJECT.DETAIL.MAINTENANCE_WINDOW.FORM.MINUTES')}` },
                { name: DURATION.h1, label: `1 ${i18n.t('PROJECT.DETAIL.MAINTENANCE_WINDOW.FORM.HOURS')}` },
                { name: DURATION.h2, label: `2 ${i18n.t('PROJECT.DETAIL.MAINTENANCE_WINDOW.FORM.HOURS')}` },
                { name: DURATION.h3, label: `3 ${i18n.t('PROJECT.DETAIL.MAINTENANCE_WINDOW.FORM.HOURS')}` },
            ]),
            selectedDuration: DURATION.m15,
            timezone: computed(() => store.state.user.timezone),
            startTimeInput: dayjs().format(DATE_TIME_FORMAT),
            endTimeInput: dayjs().add(1, 'hour').format(DATE_TIME_FORMAT),
            minTime: dayjs().format(DATE_TIME_FORMAT),
            showValidation: false,
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
            // eslint-disable-next-line camelcase
            start_time: dayjs.tz(dayjs(state.startTimeInput, DATE_TIME_FORMAT), state.timezone).utc().toISOString(),
            // eslint-disable-next-line camelcase
            end_time: dayjs.tz(dayjs(state.endTimeInput, DATE_TIME_FORMAT), state.timezone).utc().toISOString(),
        });


        /* API calls */
        const getMaintenanceWindow = async () => {
            try {
                return await SpaceConnector.client.monitoring.maintenanceWindow.get({
                    maintenance_window_id: props.maintenanceWindowId,
                });
            } catch (e) {
                console.error(e);
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

                showSuccessMessage(i18n.t('PROJECT.DETAIL.MAINTENANCE_WINDOW.ALT_S_CREATE_MAINTENANCE_WINDOW'), '', root);
                return res.maintenance_window_id;
            } catch (e) {
                showErrorMessage(i18n.t('PROJECT.DETAIL.MAINTENANCE_WINDOW.ALT_E_CREATE_MAINTENANCE_WINDOW'), e, root);
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

                showSuccessMessage(i18n.t('PROJECT.DETAIL.MAINTENANCE_WINDOW.ALT_S_UPDATE_MAINTENANCE_WINDOW'), '', root);
                return res.maintenance_window_id;
            } catch (e) {
                showErrorMessage(i18n.t('PROJECT.DETAIL.MAINTENANCE_WINDOW.ALT_E_UPDATE_MAINTENANCE_WINDOW'), e, root);
                throw e;
            }
        };


        /* Handlers */
        const onFirstInputTitle = (e) => {
            state.showValidation = true;
            state.title = e.target.value;
        };

        const onChangeStartTime = (e) => {
            const start = dayjs(e.target.value);
            if (start.isAfter(dayjs(state.endTimeInput))) {
                state.endTimeInput = start.add(1, 'hour').format(DATE_TIME_FORMAT);
            }
        };

        const onClickConfirm = async () => {
            if (!state.showValidation) state.showValidation = true;

            if (state.titleInvalidText) return;

            state.loading = true;

            try {
                checkTimes();
                getTimeParams();

                let maintenanceWindowId;
                if (props.editMode) maintenanceWindowId = await updateMaintenanceWindow();
                else maintenanceWindowId = await createMaintenanceWindow();

                state.proxyVisible = false;
                emit('confirm', maintenanceWindowId);
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
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
            const current = dayjs();
            state.startTimeInput = originMaintenanceWindow.start_time ? dayjs(originMaintenanceWindow.start_time).format(DATE_TIME_FORMAT) : current.format(DATE_TIME_FORMAT);
            state.endTimeInput = originMaintenanceWindow.end_time ? dayjs(originMaintenanceWindow.end_time).format(DATE_TIME_FORMAT) : current.add(1, 'hour').format(DATE_TIME_FORMAT);

            state.loading = false;
        };

        watch(() => props.visible, async (visible) => {
            if (visible) await reset();
        });


        return {
            ...toRefs(state),
            onFirstInputTitle,
            onChangeStartTime,
            onClickConfirm,
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
