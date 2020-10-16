<template>
    <section :class="{'edit-mode': mode !== 'READ'}" class="schedule-detail">
        <p class="section-title">
            {{ mode === 'UPDATE' ? $t('PWR_SCHED.EDIT_MODE') : (mode === 'CREATE' ? $t('PWR_SCHED.CREATE_MODE') : $t('PWR_SCHED.DETAILS')) }}
        </p>
        <div class="detail-box">
            <p-field-group v-if="mode !== 'READ'"
                           class="name-field"
                           :required="true"
            >
                <template #label>
                    <div class="name-field-label">
                        <span class="label">{{ $t('PWR_SCHED.SET_NAME') }}</span>
                        <span class="desc">{{ $t('PWR_SCHED.SET_NAME_DESC') }}</span>
                    </div>
                </template>
                <template #default="{invalid}">
                    <p-text-input v-model="proxyName" v-focus
                                  :class="{'is-invalid': showValidation && !isNameValid}"
                                  class="name-input"
                    />
                </template>
            </p-field-group>

            <div class="scroll-contents">
                <schedule-time-table
                    ref="timeTable"
                    :schedule-id="proxyScheduleId"
                    :mode="mode"
                />
            </div>
            <div class="scroll-contents">
                <schedule-kanban ref="kanban" :project-id="projectId" :schedule-id="proxyScheduleId"
                                 :mode="mode"
                />
            </div>

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
        </div>
    </section>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { computed, reactive, toRefs } from '@vue/composition-api';

import ScheduleTimeTable from '@/views/automation/power-scheduler/modules/ScheduleTimeTable.vue';
import ScheduleKanban from '@/views/automation/power-scheduler/modules/ScheduleKanban.vue';

import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';

import { makeProxy } from '@/components/util/composition-helpers';
import { SpaceConnector } from '@/lib/space-connector';
import { ViewMode } from '@/views/automation/power-scheduler/type';


interface Props {
    scheduleId?: string;
    mode: ViewMode;
    projectId: string;
    name: string;
}

export default {
    name: 'ScheduleDetail',
    components: {
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
    setup(props: Props, { emit, refs }) {
        const state = reactive({
            showValidation: false,
            isNameValid: computed(() => !!state.proxyName),
            isAllValid: computed(() => state.isNameValid),
            proxyName: makeProxy('name', props, emit),
            proxyScheduleId: makeProxy('scheduleId', props, emit),
            kanban: null,
            timeTable: null,
        });

        const createSchedule = async () => {
            const res = await SpaceConnector.client.powerScheduler.schedule.create({
                name: props.name,
                project_id: props.projectId,
            });
            state.proxyScheduleId = res.schedule_id;
            return res.schedule_id;
        };

        const updateSchedule = async () => {
            const res = await SpaceConnector.client.powerScheduler.schedule.update({
                schedule_id: state.proxyScheduleId,
                name: props.name,
            });
            return res.schedule_id;
        };

        const onClickCancel = () => {
            emit('cancel');
        };

        const onClickSave = async () => {
            let scheduleId = state.proxyScheduleId;
            state.showValidation = true;
            if (!state.isAllValid) return;
            if (props.mode === 'CREATE') {
                scheduleId = await createSchedule();
            }
            if (props.mode === 'UPDATE') {
                scheduleId = await updateSchedule();
            }
            if (props.mode === 'CREATE' || props.mode === 'UPDATE') {
                await state.timeTable.createOrUpdate(scheduleId);
                await state.kanban.onSave(scheduleId);
            }
            emit('update:mode', 'READ');
        };

        return {
            ...toRefs(state),
            onClickCancel,
            onClickSave,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .schedule-detail {
        margin-top: 3rem;
    }
    .section-title {
        @apply text-xs text-gray-500;
    }
    .detail-box {
        @apply mt-2 border border-gray-200;
        padding: 3.25rem 3rem 2.75rem;
        box-shadow: inset 0 0 1.25rem rgba(theme('colors.primary4'), 0.08);
        background-color: rgba(theme('colors.primary4'), 0.5);
    }
    .edit-mode {
        .title {
            @apply text-secondary;
        }
        .detail-box {
            @apply border-secondary;
            box-shadow: inset 0 0 1.25rem rgba(theme('colors.secondary2'), 0.08);
            background-color: rgba(theme('colors.secondary2'), 0.5);
        }
    }
    .scroll-contents {
        @apply overflow-x-auto;
    }
    .kanban {
        margin-top: 2.875rem;
    }
    .actions {
        @apply flex justify-end;
        margin-top: 2.5rem;
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
