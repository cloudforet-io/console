<script setup lang="ts">
import {
    toRef, computed, ref, watch,
} from 'vue';

import { isEqual } from 'lodash';

import { PSelectDropdown } from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { useTaskStatusField } from '@/services/ops-flow/composables/use-task-status-field';
import { useTaskTypeField } from '@/services/ops-flow/composables/use-task-type-field';
import type { TaskFilters } from '@/services/ops-flow/types/task-filters-type';

const props = defineProps<{
    categoryId?: string
}>();
const emit = defineEmits<{(event: 'update', value: TaskFilters): void;
}>();


/* task type */
const {
    selectedTaskTypeItems,
    taskTypeMenuItemsHandler,
    setSelectedTaskTypeItems,
} = useTaskTypeField({
    categoryId: toRef(props, 'categoryId'),
    isRequired: true,
});
const handleUpdateSelectedTaskTypeItems = (items: SelectDropdownMenuItem[]) => {
    setSelectedTaskTypeItems(items);
};

/* status */
const {
    selectedStatusItems,
    statusMenuItemsHandler,
    setSelectedStatusItems,
} = useTaskStatusField({
    categoryId: toRef(props, 'categoryId'),
    isRequired: true,
});
const handleUpdateSelectedStatusItems = (items: SelectDropdownMenuItem[]) => {
    setSelectedStatusItems(items);
};

/* project */
const selectedProjectIds = ref<string[]>([]);
const handleUpdateSelectedProjectIds = (projectIds: string[]) => {
    selectedProjectIds.value = projectIds;
};

/* createdBy */
const selectedCreatedBy = ref<string[]>([]);
const handleUpdateCreatedBy = (userIds: string[]) => {
    selectedCreatedBy.value = userIds;
};

/* assignee */
const selectedAssignee = ref<string[]>([]);
const handleUpdateAssignee = (userIds: string[]) => {
    console.debug('handleUpdateSelectedAssignee', userIds);
    selectedAssignee.value = userIds;
};

/* event */
const taskFilters = computed<TaskFilters>(() => ({
    taskType: selectedTaskTypeItems.value.map((d) => d.name),
    status: selectedStatusItems.value.map((d) => d.name),
    project: selectedProjectIds.value,
    createdBy: selectedCreatedBy.value,
    assignee: selectedAssignee.value,
}));
watch(taskFilters, (newValue, oldValue) => {
    if (!isEqual(newValue, oldValue)) {
        emit('update', newValue);
    }
});
</script>

<template>
    <div class="flex flex-wrap gap-4">
        <p-select-dropdown v-if="props.categoryId"
                           :selected="selectedTaskTypeItems"
                           :handler="taskTypeMenuItemsHandler"
                           selection-label="Topic"
                           appearance-type="badge"
                           style-type="rounded"
                           multi-selectable
                           show-select-marker
                           show-delete-all-button
                           @update:selected="handleUpdateSelectedTaskTypeItems"
        />
        <p-select-dropdown v-if="props.categoryId"
                           :selected="selectedStatusItems"
                           :handler="statusMenuItemsHandler"
                           selection-label="Status"
                           appearance-type="badge"
                           style-type="rounded"
                           multi-selectable
                           show-select-marker
                           show-delete-all-button
                           @update:selected="handleUpdateSelectedStatusItems"
        />
        <project-select-dropdown multi-selectable
                                 project-selectable
                                 :selected-project-ids="selectedProjectIds"
                                 selection-label="Project"
                                 style-type="rounded"
                                 appearance-type="badge"
                                 show-delete-all-button
                                 :block="false"
                                 @update:selected-project-ids="handleUpdateSelectedProjectIds"
        />
        <user-select-dropdown multi-selectable
                              :user-ids="selectedCreatedBy"
                              selection-label="Created By"
                              style-type="rounded"
                              appearance-type="badge"
                              selection-type="multiple"
                              :block="false"
                              @update:user-ids="handleUpdateCreatedBy"
        />
        <user-select-dropdown multi-selectable
                              :user-ids="selectedAssignee"
                              selection-label="Assignee"
                              style-type="rounded"
                              appearance-type="badge"
                              selection-type="multiple"
                              :block="false"
                              @update:user-ids="handleUpdateAssignee"
        />
    </div>
</template>
