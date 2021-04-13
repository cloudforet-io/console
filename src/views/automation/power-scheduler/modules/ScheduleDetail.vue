<template>
    <div class="schedule-detail">
        <p-page-title :title="title"
                      :child="mode === 'READ' || firstCreate"
                      @goBack="$router.go(-1)"
        >
            <template #title>
                <span>{{ title }}</span>
                <div class="status-wrapper">
                    <p-i v-if="SCHEDULE_STATUS[status].icon" :name="SCHEDULE_STATUS[status].icon" />
                    <p-lottie v-else :name="SCHEDULE_STATUS[status].lottie" :size="1.5" />
                    <span class="text" :style="{color: SCHEDULE_STATUS[status].textColor}">
                        {{ statusText[status] }}
                    </span>
                </div>
            </template>
            <template #extra>
                <p-icon-button v-if="mode === 'READ'" class="ml-2" name="ic_trashcan"
                               :disabled="disabledState.visible" @click="onClickDelete"
                />
                <p-icon-button v-if="mode === 'READ'" name="ic_edit-text"
                               :disabled="disabledState.visible" @click="onClickNameEdit"
                />
            </template>
        </p-page-title>

        <section>
            <div v-if="mode === 'READ'" class="section-wrapper">
                <div v-if="disabledState.visible" class="section-disabled" @click.prevent />
            </div>

            <p-field-group v-if="mode === 'CREATE'" class="name-field"
                           :required="true"
                           :invalid="nameEditState.showValidation && !nameEditState.isValid"
            >
                <template #label>
                    <div class="name-field-label">
                        <span class="label">{{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.SET_NAME_TITLE') }}</span>
                        <span class="desc">{{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.SET_NAME_DESC') }}</span>
                    </div>
                </template>
                <template #default="{invalid}">
                    <p-text-input v-model="nameEditState.name" v-focus
                                  :invalid="invalid"
                                  class="name-input"
                    />
                </template>
            </p-field-group>

            <div class="section-wrapper">
                <schedule-time-table ref="timeTable"
                                     :schedule-id="scheduleId"
                                     :mode="mode"
                                     @edit-start="onEditStart('time-table')"
                                     @edit-finish="onEditFinish('time-table')"
                                     @open-check-modal="checkModalState.visible = true"
                />
                <div v-if="disabledState.visible && disabledState.current !== 'time-table'" class="section-disabled" @click.prevent />
            </div>

            <div class="section-wrapper">
                <schedule-kanban ref="kanban"
                                 :project-id="projectId"
                                 :schedule-id="scheduleId"
                                 :mode="mode"
                                 @edit-start="onEditStart('kanban')"
                                 @edit-finish="onEditFinish('kanban')"
                />
                <div v-if="disabledState.visible && disabledState.current !== 'kanban'" class="section-disabled" @click.prevent />
            </div>

            <div v-if="mode === 'CREATE'" class="actions">
                <p-button v-if="!firstCreate" style-type="gray900" :outline="true"
                          @click="onClickCancel"
                >
                    {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.CANCEL') }}
                </p-button>
                <p-button class="ml-4" style-type=" secondary"
                          :disabled="nameEditState.showValidation && !nameEditState.isValid"
                          @click="onClickSave"
                >
                    {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.SAVE') }}
                </p-button>
            </div>
        </section>

        <p-button-modal :header-title="checkDeleteState.headerTitle"
                        :scrollable="false"
                        size="md"
                        :fade="true"
                        :backdrop="true"
                        :visible.sync="checkDeleteState.visible"
                        theme-color="alert"
                        @confirm="scheduleDeleteConfirm"
        >
            <template #body>
                <p class="delete-modal-content">
                    {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.CHECK_DELETE_MODAL_DESC') }}
                </p>
            </template>
        </p-button-modal>

        <p-button-modal :header-title="$t('AUTOMATION.POWER_SCHEDULER.DETAILS.CHECK_TIME_SET_MODAL_TITLE')"
                        size="md"
                        fade
                        :visible.sync="checkModalState.visible"
                        theme-color="alert"
                        :loading="createLoading"
                        @confirm="onClickCheckModalConfirm"
        >
            <template #body>
                <p class="delete-modal-content">
                    {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.CHECK_TIME_SET_MODAL_DESC_1') }}
                    <br>
                    {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.CHECK_TIME_SET_MODAL_DESC_2') }}
                </p>
            </template>
            <template #cancel-button>
                {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.CHECK_TIME_SET_NO_TEXT') }}
            </template>
            <template #confirm-button>
                {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.CHECK_TIME_SET_YES_TEXT') }}
            </template>
        </p-button-modal>

        <p-button-modal :header-title="nameEditState.headerTitle" size="md"
                        :visible.sync="nameEditState.visible"
                        :disabled="nameEditState.loading ||
                            (nameEditState.showValidation && !nameEditState.isValid)"
                        @confirm="onNameEditConfirm"
        >
            <template #body>
                <p-field-group class="name-field"
                               :required="true"
                               :invalid="nameEditState.showValidation && !nameEditState.isValid"
                >
                    <template #label>
                        <div class="name-field-label">
                            <span class="label">{{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.SET_NAME_TITLE') }}</span>
                            <span class="desc">{{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.SET_NAME_DESC') }}</span>
                        </div>
                    </template>
                    <template #default="{invalid}">
                        <p-text-input v-model="nameEditState.name" v-focus
                                      :invalid="invalid"
                                      class="name-input"
                        />
                    </template>
                </p-field-group>
            </template>
        </p-button-modal>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, onMounted, onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';

import ScheduleTimeTable from '@/views/automation/power-scheduler/modules/ScheduleTimeTable.vue';
import ScheduleKanban from '@/views/automation/power-scheduler/modules/ScheduleKanban.vue';

import {
    defaultSchedule, SCHEDULE_STATUS, Schedule, ViewMode,
} from '@/views/automation/power-scheduler/type';

import { SpaceConnector } from '@/lib/space-connector';
import {
    iso8601Formatter, showErrorMessage, showSuccessMessage,
} from '@/lib/util';

import {
    PButtonModal, PFieldGroup, PTextInput, PIconButton, PButton, PPageTitle, PI, PLottie,
} from '@spaceone/design-system';

import { store } from '@/store';


interface Props {
    scheduleId?: string;
    mode: ViewMode;
    projectId: string;
    firstCreate: boolean;
}

type sectionType = 'kanban'|'time-table'


export default {
    name: 'ScheduleDetail',
    components: {
        PButton,
        PIconButton,
        PPageTitle,
        PButtonModal,
        PTextInput,
        PFieldGroup,
        PI,
        PLottie,
        ScheduleTimeTable,
        ScheduleKanban,
    },
    directives: {
        focus: {
            inserted(el) {
                el.focus();
            },
        },
    },
    props: {
        scheduleId: {
            type: String,
            default: undefined,
        },
        projectId: {
            type: String,
            required: true,
        },
        mode: {
            type: String,
            default: 'READ',
        },
        firstCreate: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props, { emit, root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const nameEditState = reactive({
            visible: false,
            name: '',
            isValid: computed(() => !!nameEditState.name),
            showValidation: false,
            loading: false,
            headerTitle: computed(() => vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.EDIT_NAME_MODAL_TITLE')),
        });

        const state = reactive({
            timezone: computed(() => store.state.user.timezone),
            title: computed(() => (props.mode === 'CREATE' ? vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.CREATE_SCHEDULER') : state.schedule.name)),

            schedule: { ...defaultSchedule } as Schedule,
            kanban: null,
            timeTable: null,
            loading: true,
            createLoading: false,
            //
            created: '',
            status: 'OFF' as keyof typeof SCHEDULE_STATUS,
            statusText: computed(() => ({
                ON: vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.STATUS_ON'),
                OFF: vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.STATUS_OFF'),
                STARTING: vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.STATUS_STARTING'),
                STOPPING: vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.STATUS_STOPPING'),
            })),
        });

        const disabledState = reactive({
            visible: false,
            current: '' as sectionType,
        });


        const checkModalState = reactive({
            visible: false,
        });

        const checkDeleteState = reactive({
            visible: false,
            headerTitle: computed(() => vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.CHECK_DELETE_MODAL_TITLE')),
        });

        const onClickNameEdit = () => {
            nameEditState.showValidation = false;
            nameEditState.name = state.schedule.name;
            nameEditState.visible = true;
        };

        const onNameEditConfirm = async () => {
            nameEditState.showValidation = true;
            if (!nameEditState.isValid) return;

            nameEditState.loading = true;
            try {
                await SpaceConnector.client.powerScheduler.schedule.update({
                    schedule_id: props.scheduleId,
                    name: nameEditState.name,
                });
                state.schedule.name = nameEditState.name;
                showSuccessMessage(vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.ALT_S_EDIT_NAME'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.ALT_E_EDIT_NAME'), e, root);
            } finally {
                nameEditState.visible = false;
                nameEditState.loading = false;
            }
            emit('update');
        };

        const onClickDelete = () => {
            checkDeleteState.visible = true;
        };

        const scheduleDeleteConfirm = async () => {
            try {
                await SpaceConnector.client.powerScheduler.schedule.delete({
                    schedule_id: props.scheduleId,
                });
                showSuccessMessage(vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.ALT_S_DELETE_SCHEDULER'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.ALT_E_DELETE_SCHEDULER'), e, root);
            } finally {
                checkDeleteState.visible = false;
                emit('delete');
            }
        };

        const getScheduleStatus = async () => {
            try {
                const res = await SpaceConnector.client.powerScheduler.schedule.getScheduleStatus({
                    schedule_id: props.scheduleId,
                });
                state.status = res.status;
            } catch (e) {
                console.error(e);
            }
        };

        const getSchedule = async () => {
            state.loading = true;
            if (props.scheduleId) {
                try {
                    const res = await SpaceConnector.client.powerScheduler.schedule.get({
                        schedule_id: props.scheduleId,
                    });
                    state.schedule = res;
                    state.created = iso8601Formatter(res.created_at, state.timezone);
                } catch (e) {
                    state.schedule = { ...defaultSchedule };
                    state.created = '';
                    console.error(e);
                }
            } else {
                state.schedule = { ...defaultSchedule };
            }

            state.loading = false;
        };


        const createSchedule = async (): Promise<string> => {
            nameEditState.showValidation = true;
            if (!nameEditState.isValid) return '';

            state.createLoading = true;
            try {
                const res = await SpaceConnector.client.powerScheduler.schedule.create({
                    name: nameEditState.name,
                    project_id: props.projectId,
                });
                showSuccessMessage(vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.ALT_S_CREATE_SCHEDULER'), '', root);
                return res.schedule_id;
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.ALT_E_CREATE_SCHEDULER'), e, root);
            } finally {
                state.createLoading = false;
            }

            return '';
        };


        const createAll = async () => {
            state.createLoading = true;
            const scheduleId = props.scheduleId || await createSchedule();
            if (disabledState.visible) {
                if (disabledState.current === 'time-table') await state.timeTable.createOrUpdate(scheduleId);
                else if (disabledState.current === 'kanban') await state.kanban.onSave(scheduleId);
            } else {
                await state.timeTable.createOrUpdate(scheduleId);
                await state.kanban.onSave(scheduleId);
            }
            state.createLoading = false;
            emit('create');
            emit('edit-finish');
        };

        const onClickCancel = () => {
            nameEditState.showValidation = false;
            nameEditState.name = '';
            emit('cancel');
        };

        const onClickSave = async () => {
            nameEditState.showValidation = true;
            if (!nameEditState.isValid) return;

            if (state.timeTable.isRuleExist()) {
                await createAll();
            } else {
                checkModalState.visible = true;
            }
        };

        const onClickCheckModalConfirm = async () => {
            await createAll();
            checkModalState.visible = false;
        };

        const onEditFinish = () => {
            disabledState.visible = false;
            vm.$emit('edit-finish');
        };

        const onEditStart = (type: sectionType) => {
            disabledState.current = type;
            disabledState.visible = true;
            vm.$emit('edit-start');
        };

        watch(() => props.scheduleId, async (id) => {
            nameEditState.showValidation = false;
            const actions = [getSchedule()];
            if (id) actions.push(getScheduleStatus());
            await Promise.all(actions);
        }, { immediate: true });

        let scheduleStatusInterval;
        onMounted(() => {
            if (scheduleStatusInterval) clearInterval(scheduleStatusInterval);
            scheduleStatusInterval = setInterval(() => {
                getScheduleStatus();
            }, 5000);
        });
        onUnmounted(() => {
            if (scheduleStatusInterval) clearInterval(scheduleStatusInterval);
        });

        return {
            ...toRefs(state),
            nameEditState,
            checkModalState,
            checkDeleteState,
            disabledState,
            onClickNameEdit,
            onNameEditConfirm,
            onClickDelete,
            scheduleDeleteConfirm,
            createAll,
            onClickCancel,
            onClickSave,
            onClickCheckModalConfirm,
            onEditFinish,
            onEditStart,
            SCHEDULE_STATUS,
        };
    },
};
</script>

<style lang="postcss" scoped>
header {
    @apply flex justify-between;
    .p-page-title {
        margin-bottom: 2rem;
    }

    .section-wrapper {
        @apply relative;
        .section-disabled {
            @apply absolute w-full h-full top-0 left-0 bg-white opacity-50;
        }
    }
}

.schedule-detail {
    .title-wrapper {
        .status-wrapper {
            display: inline-block;
            margin-left: 1rem;
            .p-lottie {
                vertical-align: middle;
                display: inline-block;
            }
            .text {
                @apply text-gray-400;
                font-size: 0.875rem;
                font-weight: normal;
                line-height: 1.5;
                vertical-align: middle;
                margin-left: 0.25rem;
            }
        }
    }
}
.kanban {
    margin-top: 2.875rem;
}
.actions {
    @apply flex justify-end;
    margin-top: 1.5rem;
}
.name-field {
    margin-bottom: 3.25rem;
}
.name-field-label {
    display: inline-block;
    .label {
        @apply text-gray-900;
        font-size: 1rem;
        font-weight: bold;
        padding-right: 0.5rem;
    }
    .desc {
        @apply text-gray-400;
        font-size: 0.75rem;
    }
}
.name-input {
    @apply block mt-4 w-full;
}

.delete-modal-content {
    line-height: 160%;
}

</style>
