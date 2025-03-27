<script setup lang="ts">
import {
    PI, PBadge, PIconButton, PTooltip,
} from '@cloudforet/mirinae';

import TaskFieldTypeIcon from '@/services/ops-flow/task-fields-configuration/components/TaskFieldTypeIcon.vue';
import type { TaskFieldTypeMetadata } from '@/services/ops-flow/task-fields-configuration/types/task-field-type-metadata-type';

const props = defineProps<{
    fieldMetadata: TaskFieldTypeMetadata;
    name?: string;
    isRequired: boolean;
    isDeletable: boolean;
    isFolded: boolean;
    isDefaultField: boolean;
}>();
const emit = defineEmits<{(event: 'update:is-folded', value: boolean): void
    (event: 'delete'): void
}>();


</script>

<template>
    <div class="p-2 rounded-t-lg border-gray-150 flex items-center"
         :class="props.isFolded ? 'rounded-b-lg border-b-0' : 'border-b'"
    >
        <p-i :name="props.isFolded ? 'ic_chevron-right' : 'ic_chevron-down'"
             class="flex-shrink-0 cursor-pointer mr-1"
             @click="emit('update:is-folded', !props.isFolded)"
        />
        <p-tooltip :contents="props.fieldMetadata.name"
                   position="bottom"
        >
            <task-field-type-icon class="flex-shrink-0"
                                  :icon="fieldMetadata.icon"
            />
        </p-tooltip>
        <span class="flex-grow text-label-md pl-2">{{ props.name || fieldMetadata.name }}</span>
        <p-badge v-if="props.isRequired"
                 class="flex-shrink-0"
                 badge-type="subtle"
                 style-type="gray100"
        >
            {{ $t('OPSFLOW.FIELD_GENERATOR.REQUIRED') }}
        </p-badge>
        <p-icon-button v-if="!isDefaultField"
                       shape="square"
                       size="sm"
                       style-type="transparent"
                       name="ic_delete"
                       class="ml-1"
                       @click="emit('delete')"
        />
    </div>
</template>
