<template>
    <div>
        <section class="mt-4">
            <div v-if="mode === 'READ'">
                <p class="section-title">
                    {{ $t('PWR_SCHED.BASIC_INFO') }}
                </p>
                <div class="detail-box">
                    <div class="info-lab w-1/3">
                        <span class="title">{{ $t('PWR_SCHED.CREATED_TIME') }}</span>
                        <span class="content">{{ created }}</span>
                    </div>
                    <div class="info-lab w-1/3">
                        <span class="title">{{ $t('PWR_SCHED.TARGET_STATE') }}</span>
                    </div>
                    <div class="info-lab w-1/3">
                        <span class="title">{{ $t('PWR_SCHED.CURR_STATE') }}</span>
                    </div>
                </div>
            </div>

            <p-field-group v-if="mode !== 'READ'"
                           class="name-field"
                           :required="true"
                           :invalid="showValidation && !isNameValid"
            >
                <template #label>
                    <div class="name-field-label">
                        <span class="label">{{ $t('PWR_SCHED.SET_NAME') }}</span>
                        <span class="desc">{{ $t('PWR_SCHED.SET_NAME_DESC') }}</span>
                    </div>
                </template>
                <template #default="{invalid}">
                    <p-text-input v-model="groupName" v-focus
                                  :invalid="invalid"
                                  class="name-input"
                    />
                </template>
            </p-field-group>

            <schedule-time-table
                ref="timeTable"
                :schedule-id="scheduleId"
                :mode="mode"
            />
            <schedule-kanban ref="kanban" :project-id="projectId" :schedule-id="scheduleId"
                             :mode="mode"
            />

            <div v-if="mode !== 'READ'" class="actions">
                <p-button style-type="gray900" :outline="true" @click="onClickCancel">
                    {{ $t('PWR_SCHED.CANCEL') }}
                </p-button>
                <p-button class="ml-4" style-type=" secondary" :disabled="showValidation && !isAllValid"
                          @click="onClickSave"
                >
                    {{ $t('PWR_SCHED.SAVE') }}
                </p-button>
            </div>
        </section>
        <p-button-modal
            :header-title="$t('PWR_SCHED.CHECK_TIME_SET')"
            centered
            size="md"
            fade
            :visible.sync="checkModalState.visible"
            theme-color="alert"
            :footer-confirm-button-bind="{
                styleType: 'alert',
            }"
            :loading="loading"
            @confirm="onConfirmCheckModal"
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
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import ScheduleTimeTable from '@/views/automation/power-scheduler/modules/ScheduleTimeTable.vue';
import ScheduleKanban from '@/views/automation/power-scheduler/modules/ScheduleKanban.vue';
import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/PFieldGroup.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import { ViewMode } from '@/views/automation/power-scheduler/type';

import { SpaceConnector } from '@/lib/space-connector';
import { timestampFormatter } from '@/lib/util';


interface Props {
    scheduleId?: string;
    mode: ViewMode;
    projectId: string;
    name: string;
}

export default {
    name: 'ScheduleDetail',
    components: {
        PButtonModal,
        PTextInput,
        PFieldGroup,
        PButton,
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
        name: {
            type: String,
            default: '',
        },
    },
    setup(props: Props, { emit }) {
        const state = reactive({
            showValidation: false,
            isNameValid: computed(() => !!state.groupName),
            isAllValid: computed(() => state.isNameValid),
            groupName: props.name,
            kanban: null,
            timeTable: null,
            loading: false,
            //
            created: '',
            targetState: '',
            currentState: '',
        });

        const checkModalState = reactive({
            visible: false,
        });

        const getSchedule = async () => {
            try {
                const res = await SpaceConnector.client.powerScheduler.schedule.get({
                    schedule_id: props.scheduleId,
                });
                state.created = timestampFormatter(res.created_at);
            } catch (e) {
                console.error(e);
            }
        };

        const createSchedule = async () => {
            try {
                const res = await SpaceConnector.client.powerScheduler.schedule.create({
                    name: state.groupName,
                    project_id: props.projectId,
                });
                return res.schedule_id;
            } catch (e) {
                console.error(e);
                return '';
            }
        };

        const updateSchedule = async () => {
            try {
                const res = await SpaceConnector.client.powerScheduler.schedule.update({
                    schedule_id: props.scheduleId,
                    name: state.groupName,
                });
                return res.schedule_id;
            } catch (e) {
                console.error(e);
                return '';
            }
        };

        const onClickCancel = () => {
            emit('cancel');
        };

        const onConfirmCheckModal = async () => {
            if (props.mode !== 'READ') {
                state.loading = true;
                let scheduleId = props.scheduleId;
                if (props.mode === 'CREATE') {
                    scheduleId = await createSchedule();
                } else if (props.mode === 'UPDATE') {
                    scheduleId = await updateSchedule();
                }

                await state.timeTable.createOrUpdate(scheduleId);
                await state.kanban.onSave(scheduleId);
                state.loading = false;
            }
            emit('confirm');
        };

        const onClickSave = () => {
            state.showValidation = true;
            if (!state.isAllValid) return;

            if (state.timeTable.isRuleExist()) {
                onConfirmCheckModal();
            } else {
                checkModalState.visible = true;
            }
        };

        watch(() => props.scheduleId, (after) => {
            state.showValidation = false;
            state.groupName = props.name;
            if (after) {
                getSchedule();
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            checkModalState,
            onClickCancel,
            onClickSave,
            onConfirmCheckModal,
        };
    },
};
</script>

<style lang="postcss" scoped>
.section-title {
    @apply text-xs text-gray-900;
    margin-bottom: 0.5rem;
}
.detail-box {
    @apply mt-2 border border-gray-200;
    display: flex;
    width: 100%;
    height: 4.5rem;
    border-radius: 2px;
    padding: 1rem 0;
    margin-bottom: 3.25rem;
    .info-lab {
        @apply border-r border-gray-200;
        font-size: 0.875rem;
        line-height: 2.25rem;
        padding: 0 1.5rem;
        &:last-of-type {
            @apply border-none;
        }
        .title {
            @apply text-gray-400;
            font-weight: bold;
        }
        .content {
            float: right;
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
</style>
