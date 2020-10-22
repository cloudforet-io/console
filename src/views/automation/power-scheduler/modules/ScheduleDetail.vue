<template>
    <div>
        <header>
            <p-page-title :title="title"
                          :child="mode === 'READ' || firstCreate"
                          @goBack="$router.go(-1)"
            >
                <template #extra>
                    <p-icon-button v-if="mode === 'READ'" class="ml-2" name="ic_trashcan"
                                   :disabled="disabledState.visible" @click="onClickDelete"
                    />
                    <p-icon-button v-if="mode === 'READ'" class="ml-2" name="ic_edit-text"
                                   :disabled="disabledState.visible" @click="onClickNameEdit"
                    />
                </template>
            </p-page-title>
        </header>

        <section class="mt-4">
            <div v-if="mode === 'READ'" class="section-wrapper">
                <div class="detail-wrapper">
                    <div class="info-group">
                        <span class="title">{{ $t('PWR_SCHED.SETTING') }}</span>
                        <p-status v-if="DESIRED_STATES[desiredState]"
                                  :icon-color="DESIRED_STATES[desiredState].iconColor"
                                  :text-color="DESIRED_STATES[desiredState].textColor"
                                  :text="DESIRED_STATES[desiredState].label"
                                  class="ml-2"
                        />
                    </div>
                    <div class="info-group">
                        <span class="title">{{ $t('PWR_SCHED.CURR_STATE') }}</span>
                        <p-status v-if="BOOTING_STATES[jobStatus]"
                                  :icon-color="BOOTING_STATES[jobStatus].iconColor"
                                  :text-color="BOOTING_STATES[jobStatus].textColor"
                                  :text="BOOTING_STATES[jobStatus].label"
                                  class="ml-2"
                        />
                    </div>
                </div>
                <div v-if="disabledState.visible" class="section-disabled" @click.prevent />
            </div>

            <p-field-group v-if="mode === 'CREATE'" class="name-field"
                           :required="true"
                           :invalid="nameEditState.showValidation && !nameEditState.isValid"
            >
                <template #label>
                    <div class="name-field-label">
                        <span class="label">{{ $t('PWR_SCHED.SET_NAME') }}</span>
                        <span class="desc">{{ $t('PWR_SCHED.SET_NAME_DESC') }}</span>
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
                    {{ $t('PWR_SCHED.CANCEL') }}
                </p-button>
                <p-button class="ml-4" style-type=" secondary"
                          :disabled="nameEditState.showValidation && !nameEditState.isValid"
                          @click="onClickSave"
                >
                    {{ $t('PWR_SCHED.SAVE') }}
                </p-button>
            </div>
        </section>

        <p-button-modal :header-title="checkDeleteState.headerTitle"
                        :centered="true"
                        :scrollable="false"
                        size="md"
                        :fade="true"
                        :backdrop="true"
                        :visible.sync="checkDeleteState.visible"
                        theme-color="alert"
                        :footer-confirm-button-bind="{styleType: 'alert'}"
                        @confirm="scheduleDeleteConfirm"
        >
            <template #body>
                <p class="delete-modal-content">
                    {{ $t('PWR_SCHED.CHECK_DELETE_DESC') }}
                </p>
            </template>
        </p-button-modal>

        <p-button-modal :header-title="$t('PWR_SCHED.CHECK_TIME_SET')"
                        centered
                        size="md"
                        fade
                        :visible.sync="checkModalState.visible"
                        theme-color="alert"
                        :footer-confirm-button-bind="{
                            styleType: 'alert',
                        }"
                        :loading="createLoading"
                        @confirm="onClickCheckModalConfirm"
        >
            <template #body>
                <p class="delete-modal-content">
                    {{ $t('PWR_SCHED.CHECK_TIME_SET_DESC') }}
                    <br>
                    {{ $t('PWR_SCHED.CHECK_TIME_SET_DESC2') }}
                </p>
            </template>
            <template #cancel-button>
                {{ $t('PWR_SCHED.CHECK_TIME_SET_NO') }}
            </template>
            <template #confirm-button>
                {{ $t('PWR_SCHED.CHECK_TIME_SET_YES') }}
            </template>
        </p-button-modal>

        <p-button-modal :header-title="nameEditState.headerTitle" centered size="md"
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
                            <span class="label">{{ $t('PWR_SCHED.SET_NAME') }}</span>
                            <span class="desc">{{ $t('PWR_SCHED.SET_NAME_DESC') }}</span>
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
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import ScheduleTimeTable from '@/views/automation/power-scheduler/modules/ScheduleTimeTable.vue';
import ScheduleKanban from '@/views/automation/power-scheduler/modules/ScheduleKanban.vue';
import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/PFieldGroup.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import {
    BOOTING_STATES, defaultSchedule, DESIRED_STATES, Schedule, ViewMode,
} from '@/views/automation/power-scheduler/type';

import { SpaceConnector } from '@/lib/space-connector';
import { showErrorMessage, showSuccessMessage, timestampFormatter } from '@/lib/util';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PStatus from '@/components/molecules/status/PStatus.vue';


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
        PStatus,
        PButton,
        PIconButton,
        PPageTitle,
        PButtonModal,
        PTextInput,
        PFieldGroup,
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
            headerTitle: computed(() => vm.$t('PWR_SCHED.EDIT_NAME')),
        });

        const state = reactive({
            title: computed(() => (props.mode === 'CREATE' ? vm.$t('PWR_SCHED.CREATE') : state.schedule.name)),

            schedule: { ...defaultSchedule } as Schedule,
            kanban: null,
            timeTable: null,
            loading: true,
            createLoading: false,
            //
            created: '',
            desiredState: '',
            jobStatus: '',
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
            headerTitle: computed(() => vm.$t('PWR_SCHED.CHECK_DELETE')),
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
                showSuccessMessage(vm.$t('PWR_SCHED.SUCCESS'), nameEditState.headerTitle, root);
            } catch (e) {
                console.error(e);
                showErrorMessage(`${checkDeleteState.headerTitle} ${vm.$t('PWR_SCHED.SUCCESS')}`, e, root);
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
                showSuccessMessage(vm.$t('PWR_SCHED.SUCCESS'), checkDeleteState.headerTitle, root);
            } catch (e) {
                console.error(e);
                showErrorMessage(`${checkDeleteState.headerTitle} ${vm.$t('PWR_SCHED.SUCCESS')}`, e, root);
            } finally {
                checkDeleteState.visible = false;
                emit('delete');
            }
        };

        const getScheduleState = async () => {
            try {
                const res = await SpaceConnector.client.powerScheduler.schedule.getScheduleState({
                    schedule_id: props.scheduleId,
                });
                state.desiredState = res.desired_state;
                state.jobStatus = res.job_status;
            } catch (e) {
                state.desiredState = '';
                state.jobStatus = '';
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
                    state.created = timestampFormatter(res.created_at);
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
                showSuccessMessage(vm.$t('PWR_SCHED.SUCCESS'), vm.$t('PWR_SCHED.CREATE_SUCCESS'), root);
                return res.schedule_id;
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('PWR_SCHED.CREATE_FAIL'), e, root);
            } finally {
                state.createLoading = false;
            }

            return '';
        };


        const createAll = async () => {
            state.createLoading = true;
            const scheduleId = await createSchedule();
            await state.timeTable.createOrUpdate(scheduleId);
            await state.kanban.onSave(scheduleId);
            state.createLoading = false;
            emit('create');
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
            if (id) actions.push(getScheduleState());
            await Promise.all(actions);
        }, { immediate: true });

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
            DESIRED_STATES,
            BOOTING_STATES,
        };
    },
};
</script>

<style lang="postcss" scoped>
header {
    @apply flex justify-between;
}
.detail-wrapper {
    @apply mt-2 border border-gray-200;
    display: flex;
    width: 100%;
    height: 3.5rem;
    border-radius: 2px;
    margin-bottom: 3.25rem;
    .info-group {
        @apply border-r border-gray-200 w-1/2;
        font-size: 0.875rem;
        padding: 0 1.5rem;
        margin: auto 0;
        &:last-of-type {
            @apply border-none;
        }
        .title {
            @apply text-gray-400;
            font-weight: bold;
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

.section-wrapper {
    @apply relative;
    .section-disabled {
        @apply absolute w-full h-full top-0 left-0 bg-white opacity-50;
    }
}

</style>
