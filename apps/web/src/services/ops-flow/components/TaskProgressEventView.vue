<script setup lang="ts">
import { asyncComputed } from '@vueuse/core';
import { computed } from 'vue';


import type { TaskField } from '@/api-clients/opsflow/_types/task-field-type';
import type { EventAdditionalInfo, EventType } from '@/api-clients/opsflow/event/schema/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useTimezoneDate } from '@/common/composables/timezone-date';

import { TASK_STATUS_LABELS } from '@/services/ops-flow/constants/task-status-label-constant';
import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';
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

const taskTypeStore = useTaskTypeStore();
const taskFieldMetadataStore = useTaskFieldMetadataStore();

const fields = asyncComputed<TaskField[]>(async () => {
    if (!props.taskTypeId) return [];
    const taskMap = taskTypeStore.state.fullFieldsItemMap[props.taskTypeId];
    if (taskMap) {
        return taskMap.fields;
    }
    try {
        await taskTypeStore.getWithFullFields(props.taskTypeId);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
    return taskTypeStore.state.fullFieldsItemMap[props.taskTypeId]?.fields ?? [];
}, [], { lazy: true });
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


const { getTimezoneDate } = useTimezoneDate();
</script>

<template>
    <div>
        <template v-if="props.eventType === 'CREATED'">
            {{ props.additionalInfo.created_by || 'Unknown' }} | {{ getTimezoneDate(props.additionalInfo.created_at) }}
        </template>
        <template v-else-if="props.eventType === 'UPDATED'">
            <p>{{ props.additionalInfo.updated_by || 'Unknown' }} | {{ getTimezoneDate(props.additionalInfo.updated_at) }}</p>
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
            <p>{{ props.additionalInfo.changed_by || 'Unknown' }} | {{ getTimezoneDate(props.additionalInfo.changed_at) }}</p>
            <template v-if="props.additionalInfo.before_status">
                [{{ $t('OPSFLOW.TASK_BOARD.BEFORE') }}] {{ props.additionalInfo.before_status.name }}({{ TASK_STATUS_LABELS[props.additionalInfo.before_status.status_type] }}) →
            </template>
            <template v-if="props.additionalInfo.after_status">
                [{{ $t('OPSFLOW.TASK_BOARD.AFTER') }}] {{ props.additionalInfo.after_status.name }}({{ TASK_STATUS_LABELS[props.additionalInfo.after_status.status_type] }})
            </template>
        </template>
    </div>
</template>

