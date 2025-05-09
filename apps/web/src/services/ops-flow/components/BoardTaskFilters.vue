<script setup lang="ts">
import {
    toRef, computed, ref, watch,
} from 'vue';

import { isEqual } from 'lodash';

import { PSelectDropdown, PBadge } from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { useTaskIdsField } from '@/services/ops-flow/composables/use-task-ids-field';
import { useTaskStatusField } from '@/services/ops-flow/composables/use-task-status-field';
import { useTaskTypeField } from '@/services/ops-flow/composables/use-task-type-field';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';
import type { TaskFilters } from '@/services/ops-flow/types/task-filters-type';

const props = defineProps<{
    categoryId?: string
}>();
const emit = defineEmits<{(event: 'update', value: TaskFilters): void;
}>();

const taskManagementTemplateStore = useTaskManagementTemplateStore();

/* task id */
const {
    selectedTaskIdItems,
    taskIdMenuItemsHandler,
    setSelectedTaskIdItems,
    taskIdsDropdownKey,
} = useTaskIdsField({
    categoryId: toRef(props, 'categoryId'),
    isRequired: true,
});
const handleUpdateSelectedTaskIdItems = (items: SelectDropdownMenuItem[]) => {
    setSelectedTaskIdItems(items);
};

/* task type */
const {
    selectedTaskTypeItems,
    taskTypeMenuItemsHandler,
    setSelectedTaskTypeItems,
    taskTypesDropdownKey,
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
    taskStatusDropdownKey,
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
    selectedAssignee.value = userIds;
};

/* event */
const taskFilters = computed<TaskFilters>(() => ({
    taskId: selectedTaskIdItems.value.map((d) => d.name),
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
        <div v-if="props.categoryId">
            <p-select-dropdown :key="taskIdsDropdownKey"
                               :selected="selectedTaskIdItems"
                               :handler="taskIdMenuItemsHandler"
                               :selection-label="String($t('OPSFLOW.FIELD_ID', { field: taskManagementTemplateStore.templates.task }))"
                               appearance-type="badge"
                               style-type="rounded"
                               multi-selectable
                               show-select-marker
                               show-delete-all-button
                               is-filterable
                               menu-width="12rem"
                               @update:selected="handleUpdateSelectedTaskIdItems"
            />
        </div>
        <p-select-dropdown v-if="props.categoryId"
                           :key="taskTypesDropdownKey"
                           :selected="selectedTaskTypeItems"
                           :handler="taskTypeMenuItemsHandler"
                           :selection-label="taskManagementTemplateStore.templates.TaskType"
                           appearance-type="badge"
                           style-type="rounded"
                           multi-selectable
                           show-select-marker
                           show-delete-all-button
                           @update:selected="handleUpdateSelectedTaskTypeItems"
        />
        <p-select-dropdown v-if="props.categoryId"
                           :key="taskStatusDropdownKey"
                           :selected="selectedStatusItems"
                           :handler="statusMenuItemsHandler"
                           :selection-label="$t('OPSFLOW.STATUS')"
                           appearance-type="badge"
                           style-type="rounded"
                           multi-selectable
                           show-select-marker
                           show-delete-all-button
                           @update:selected="handleUpdateSelectedStatusItems"
        >
            <template #menu-item--format="{ item }">
                <p-badge badge-type="subtle"
                         :style-type="item.color"
                >
                    {{ item.label }}
                </p-badge>
            </template>
        </p-select-dropdown>
        <project-select-dropdown multi-selectable
                                 project-selectable
                                 :project-group-selectable="false"
                                 :selected-project-ids="selectedProjectIds"
                                 :selection-label="String($t('OPSFLOW.PROJECT'))"
                                 style-type="rounded"
                                 appearance-type="badge"
                                 show-delete-all-button
                                 :block="false"
                                 @update:selected-project-ids="handleUpdateSelectedProjectIds"
        />
        <div>
            <user-select-dropdown multi-selectable
                                  use-fixed-menu-style
                                  :selected-ids="selectedCreatedBy"
                                  :selection-label="String($t('OPSFLOW.CREATED_BY'))"
                                  style-type="rounded"
                                  :show-user-group-list="false"
                                  appearance-type="badge"
                                  selection-type="multiple"
                                  @update:selected-ids="handleUpdateCreatedBy"
            />
        </div>
        <div>
            <user-select-dropdown multi-selectable
                                  use-fixed-menu-style
                                  :selected-ids="selectedAssignee"
                                  :selection-label="String($t('OPSFLOW.ASSIGNEE'))"
                                  style-type="rounded"
                                  :show-user-group-list="false"
                                  appearance-type="badge"
                                  selection-type="multiple"
                                  @update:selected-ids="handleUpdateAssignee"
            />
        </div>
    </div>
</template>
