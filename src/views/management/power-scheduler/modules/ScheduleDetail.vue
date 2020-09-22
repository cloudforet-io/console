<template>
    <section :class="{'edit-mode': mode !== 'READ'}" class="schedule-detail">
        <p class="title">
            {{ mode === 'UPDATE' ? $t('PWR_SCHED.EDIT_MODE') : (mode === 'CREATE' ? $t('PWR_SCHED.CREATE_MODE') : $t('PWR_SCHED.DETAILS')) }}
        </p>
        <div class="detail-box">
            <div class="scroll-contents">
                <schedule-time-table :schedule-id="scheduleId" :mode="mode" />
            </div>
            <div class="scroll-contents">
                <schedule-kanban class="kanban" :schedule-id="scheduleId" :mode="mode" />
            </div>
            <div v-if="mode !== 'READ'" class="actions">
                <p-button style-type="gray900" :outline="true" @click="onClickCancel">
                    {{ $t('PWR_SCHED.CANCEL') }}
                </p-button>
                <p-button class="ml-4" style-type="secondary" :disabled="!isValid">
                    {{ $t('PWR_SCHED.SAVE') }}
                </p-button>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import ScheduleKanban from '@/views/management/power-scheduler/modules/ScheduleKanban.vue';
import ScheduleTimeTable from '@/views/management/power-scheduler/modules/ScheduleTimeTable.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import { reactive, toRefs } from '@vue/composition-api';

export default {
    name: 'ScheduleDetail',
    components: { PButton, ScheduleTimeTable, ScheduleKanban },
    props: {
        scheduleId: {
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
    setup(props, { emit }) {
        const state = reactive({
            isValid: false,
        });

        const onClickCancel = () => {
            emit('update:mode', 'READ');
        };
        return {
            ...toRefs(state),
            onClickCancel,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .schedule-detail {
        margin-top: 3rem;
    }
    .title {
        @apply text-xs text-gray-500;
    }
    .detail-box {
        @apply mt-2 border border-gray-200;
        padding: 3.25rem 3rem;
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
</style>
