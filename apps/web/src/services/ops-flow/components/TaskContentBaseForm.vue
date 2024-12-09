<script setup lang="ts">
import { computed, watch } from 'vue';

import {
    PFieldTitle, PFieldGroup, PSelectDropdown, PPaneLayout, PButton,
} from '@cloudforet/mirinae';

import { useFieldValidator, useFormValidator } from '@/common/composables/form-validator';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { useCategoryField } from '@/services/ops-flow/composables/use-category-field';
import { useTaskStatusField } from '@/services/ops-flow/composables/use-task-status-field';
import { useTaskTypeField } from '@/services/ops-flow/composables/use-task-type-field';
import { useTaskContentFormStore } from '@/services/ops-flow/stores/task-content-form-store';

const taskContentFormStore = useTaskContentFormStore();
const taskContentFormState = taskContentFormStore.state;
const taskContentFormGetters = taskContentFormStore.getters;

/* category */
const {
    selectedCategoryItems,
    categoryValidator,
    categoryMenuItemsHandler,
    setInitialCategory,
} = useCategoryField({
    isRequired: true,
    hasTaskTypeOnly: true,
});
const handleUpdateSelectedCategory = (items) => {
    taskContentFormStore.setCurrentCategoryId(items[0].name);
    // watcher automatically updates forms
};

/* task type */
const {
    selectedTaskTypeItems,
    taskTypeValidator,
    taskTypeMenuItemsHandler,
    setInitialTaskType,
} = useTaskTypeField({
    categoryId: computed(() => taskContentFormGetters.currentCategory?.category_id),
    isRequired: true,
});
const handleUpdateSelectedTaskType = async (items) => {
    await taskContentFormStore.setCurrentTaskType(items[0].name);
    // watcher automatically updates forms
};

/* status */
const {
    selectedStatusItems,
    taskStatusValidator,
    statusMenuItemsHandler,
    setSelectedStatusItems,
    setInitialStatus,
} = useTaskStatusField({
    categoryId: computed(() => taskContentFormGetters.currentCategory?.category_id),
    isRequired: true,
});
const handleUpdateSelectedStatus = (items) => {
    taskContentFormStore.setStatusId(items[0].name);
    setSelectedStatusItems(items);
};

/* assignee */
const assigneeValidator = useFieldValidator('', (value) => {
    if (!taskContentFormGetters.currentCategory || !taskContentFormState.currentTaskType) return true;
    if (!value) return 'Assignee is required';
    return true;
});
const assignee = assigneeValidator.value;
const handleUpdateSelectedAssignee = (userId?: string) => {
    taskContentFormStore.setAssignee(userId);
    assigneeValidator.setValue(userId ?? '');
};
const handleClickAssign = () => {
    taskContentFormStore.openAssignModal(assignee.value, taskContentFormState.currentTaskType?.assignee_pool);
};

/* form validator */
const {
    invalidState,
    invalidTexts,
    isAllValid,
    resetValidations,
} = useFormValidator({
    category: categoryValidator,
    taskType: taskTypeValidator,
    status: taskStatusValidator,
    assignee: assigneeValidator,
});
watch(isAllValid, (isValid) => {
    taskContentFormStore.setIsBaseFormValid(isValid);
}, { immediate: true });

/* automatically initiate and update form */
watch(() => taskContentFormGetters.currentCategory, async (currentCategory) => {
    if (currentCategory) {
        // init selected category
        await setInitialCategory(currentCategory.category_id);
        // init selected task type
        setInitialTaskType(taskContentFormState.currentTaskType);
        // init selected status
        const defaultStatus = currentCategory.status_options.TODO.find((status) => status.is_default);
        setInitialStatus(defaultStatus);
        taskContentFormStore.setStatusId(defaultStatus?.status_id);
        // init selected assignee
        assigneeValidator.setValue(taskContentFormState.assignee ?? '');
    }
    resetValidations();
}, { immediate: true });
watch(() => taskContentFormState.currentTaskType, (currentTaskType) => {
    if (currentTaskType && currentTaskType !== taskContentFormState.currentTaskType) {
        // init selected task type
        setInitialTaskType(currentTaskType);
        // init selected assignee
        assigneeValidator.setValue(taskContentFormState.assignee ?? '');
    }
    resetValidations();
}, { immediate: true });
watch(() => taskContentFormState.assignee, (user) => {
    if (user && user !== assignee.value) {
        assigneeValidator.setValue(user ?? '');
    }
    resetValidations();
}, { immediate: true });
</script>

<template>
    <component :is="taskContentFormState.mode === 'create-minimal' ? 'div' : PPaneLayout"
               class="flex flex-wrap gap-4"
               :class="taskContentFormState.mode === 'create-minimal' ? '' : 'py-6 px-4'"
    >
        <div class="base-form-top-wrapper">
            <div class="base-form-field-wrapper">
                <p-field-group label="Category"
                               :style-type="taskContentFormState.mode === 'create-minimal' ? 'primary' : 'secondary'"
                               required
                               :invalid="invalidState.category"
                               :invalid-text="invalidTexts.category"
                >
                    <p-select-dropdown :selected="selectedCategoryItems"
                                       :handler="categoryMenuItemsHandler"
                                       :invalid="invalidState.category"
                                       :readonly="taskContentFormState.mode === 'view'"
                                       block
                                       @update:selected="handleUpdateSelectedCategory"
                    />
                </p-field-group>
            </div>
            <div class="base-form-field-wrapper">
                <p-field-group label="Type"
                               :style-type="taskContentFormState.mode === 'create-minimal' ? 'primary' : 'secondary'"
                               required
                               :invalid="invalidState.taskType"
                               :invalid-text="invalidTexts.taskType"
                >
                    <p-select-dropdown :selected="selectedTaskTypeItems"
                                       :handler="taskTypeMenuItemsHandler"
                                       :invalid="invalidState.taskType"
                                       :readonly="taskContentFormState.mode === 'view' || !taskContentFormGetters.currentCategory"
                                       block
                                       @update:selected="handleUpdateSelectedTaskType"
                    />
                </p-field-group>
            </div>
        </div>
        <div v-if="taskContentFormState.mode !== 'create-minimal'"
             class="base-form-top-wrapper"
        >
            <div class="base-form-field-wrapper">
                <p-field-group label="Status"
                               style-type="secondary"
                               required
                               :invalid="invalidState.status"
                               :invalid-text="invalidTexts.status"
                >
                    <p-select-dropdown :selected="selectedStatusItems"
                                       :handler="statusMenuItemsHandler"
                                       :invalid="invalidState.status"
                                       :readonly="taskContentFormState.mode === 'view' || !taskContentFormGetters.currentCategory"
                                       block
                                       @update:selected="handleUpdateSelectedStatus"
                    />
                </p-field-group>
            </div>
            <div class="base-form-field-wrapper">
                <div v-if="taskContentFormState.mode === 'view'">
                    <div class="flex gap-2 items-center">
                        <p-field-title size="sm"
                                       color="gray"
                        >
                            Assign to
                        </p-field-title>
                        <p-button size="sm"
                                  style-type="tertiary"
                                  @click="handleClickAssign"
                        >
                            Assign
                        </p-button>
                    </div>
                    <p class="mt-1 text-label-md text-blue-900">
                        {{ assignee || '--' }}
                    </p>
                </div>
                <p-field-group v-else
                               label="Assign to"
                               style-type="secondary"
                               required
                               :invalid="invalidState.assignee"
                               :invalid-text="invalidTexts.assignee"
                >
                    <user-select-dropdown :user-id="assignee"
                                          :invalid="invalidState.assignee"
                                          :readonly="taskContentFormState.mode === 'view' || !taskContentFormState.currentTaskType"
                                          :user-pool="taskContentFormState.currentTaskType?.assignee_pool"
                                          @update:user-id="handleUpdateSelectedAssignee"
                    />
                </p-field-group>
            </div>
        </div>
    </component>
</template>

<style scoped lang="postcss">
.base-form-top-wrapper {
    @apply flex-1 flex mobile:flex-wrap gap-4;
}
.base-form-field-wrapper {
    @apply flex-1 min-w-40 mobile:min-w-full flex flex-col gap-1;
}
</style>
