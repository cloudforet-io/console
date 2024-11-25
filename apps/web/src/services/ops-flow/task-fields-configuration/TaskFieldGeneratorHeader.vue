<script setup lang="ts">

import { PI, PBadge, PIconButton } from '@cloudforet/mirinae';

import type { TaskFieldType } from '@/schema/opsflow/_types/task-field-type';

import TaskFieldTypeIcon from '@/services/ops-flow/task-fields-configuration/components/TaskFieldTypeIcon.vue';
import {
    useTaskFieldMetadataStore,
} from '@/services/ops-flow/task-fields-configuration/stores/use-task-field-metadata-store';

const props = defineProps<{
    fieldType: TaskFieldType;
    name: string;
    isRequired: boolean;
    isDeletable: boolean;
    isFolded: boolean;
}>();
const emit = defineEmits<{(event: 'update:is-folded', value: boolean): void
    (event: 'delete'): void
}>();

const taskFieldMetadataStore = useTaskFieldMetadataStore();

</script>

<template>
    <div class="p-2 rounded-t-lg border-gray-150 flex items-center"
         :class="props.isFolded ? 'rounded-b-lg border-b-0' : 'border-b'"
    >
        <p-i :name="props.isFolded ? 'ic_chevron-right' : 'ic_chevron-down'"
             class="flex-shrink-0 cursor-pointer mr-1"
             @click="emit('update:is-folded', !props.isFolded)"
        />
        <task-field-type-icon class="flex-shrink-0"
                              :icon="taskFieldMetadataStore.taskFieldTypeMetadataMap[props.fieldType].icon"
        />
        <span class="flex-grow text-label-md pl-2">{{ props.name }}</span>
        <p-badge v-if="!props.isRequired"
                 class="flex-shrink-0"
                 badge-type="subtle"
                 style-type="gray100"
        >
            Required
        </p-badge>
        <p-icon-button v-if="!isDeletable"
                       shape="square"
                       size="sm"
                       style-type="transparent"
                       icon="ic_delete"
                       @click="emit('delete')"
        />
    </div>
</template>
