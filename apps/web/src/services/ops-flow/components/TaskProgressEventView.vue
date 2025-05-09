<script setup lang="ts">
import { computed } from 'vue';

import type { TaskField } from '@/api-clients/opsflow/_types/task-field-type';
import type { EventAdditionalInfo, EventType } from '@/api-clients/opsflow/event/schema/type';

import { useTimezoneDate } from '@/common/composables/timezone-date';

import { useTaskTypeQuery } from '@/services/ops-flow/composables/use-task-type-query';
import { TASK_STATUS_LABELS } from '@/services/ops-flow/constants/task-status-label-constant';
import {
    useTaskFieldMetadataStore,
} from '@/services/ops-flow/task-fields-configuration/stores/use-task-field-metadata-store';


const props = withDefaults(defineProps<{
    eventType: EventType;
    additionalInfo: EventAdditionalInfo;
    taskTypeId?: string;
}>(), {
    eventType: 'CREATED',
    additionalInfo: () => ({}),
    taskTypeId: undefined,
});

const taskFieldMetadataStore = useTaskFieldMetadataStore();

/* task type */
const { taskType } = useTaskTypeQuery({
    taskTypeId: computed(() => props.taskTypeId),
    params: computed(() => ({ task_type_id: props.taskTypeId as string, include_category_fields: true })),
    enabled: computed(() => !!props.taskTypeId),
});

/* fields */
const fields = computed<TaskField[]>(() => {
    if (!taskType.value) return [];
    return taskType.value.fields ?? [];
});
const fieldNameMap = computed(() => {
    const map: Record<string, string> = {};
    taskFieldMetadataStore.getters.allDefaultFields.forEach((field) => {
        map[field.field_id] = field.name;
    });
    fields.value.forEach((field) => {
        map[field.field_id] = field.name;
    });
    return map;
});

/* times */
const { getTimezoneDate } = useTimezoneDate();
const createdAt = computed(() => (props.additionalInfo.created_at ? getTimezoneDate(props.additionalInfo.created_at) : ''));
const updatedAt = computed(() => (props.additionalInfo.updated_at ? getTimezoneDate(props.additionalInfo.updated_at) : ''));
const changedAt = computed(() => (props.additionalInfo.changed_at ? getTimezoneDate(props.additionalInfo.changed_at) : ''));
</script>

<template>
    <div>
        <template v-if="props.eventType === 'CREATED'">
            {{ props.additionalInfo.created_by || 'Unknown' }} | {{ createdAt }}
        </template>
        <template v-else-if="props.eventType === 'UPDATED'">
            <p>{{ props.additionalInfo.updated_by || 'Unknown' }} | {{ updatedAt }}</p>
            <template v-if="props.additionalInfo.updated_data">
                <div v-for="(d, idx) in props.additionalInfo.updated_data"
                     :key="idx"
                >
                    {{ $t('OPSFLOW.TASK_BOARD.FIELD') }}: {{ fieldNameMap[d.updated_field] ?? d.updated_field }}<br>
                    {{ $t('OPSFLOW.TASK_BOARD.CONTENT') }}: {{ d.updated_content }}
                </div>
            </template>
        </template>
        <template v-else-if="props.eventType === 'CHANGE_STATUS'">
            <p>{{ props.additionalInfo.changed_by || 'Unknown' }} | {{ changedAt }}</p>
            <template v-if="props.additionalInfo.before_status">
                [{{ $t('OPSFLOW.TASK_BOARD.BEFORE') }}] {{ props.additionalInfo.before_status.name }}({{ TASK_STATUS_LABELS[props.additionalInfo.before_status.status_type] }}) →
            </template>
            <template v-if="props.additionalInfo.after_status">
                [{{ $t('OPSFLOW.TASK_BOARD.AFTER') }}] {{ props.additionalInfo.after_status.name }}({{ TASK_STATUS_LABELS[props.additionalInfo.after_status.status_type] }})
            </template>
        </template>
    </div>
</template>

