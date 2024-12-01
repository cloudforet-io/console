<script setup lang="ts">
import { computed, watch } from 'vue';

import {
    PFieldGroup, PSelectDropdown, PPaneLayout,
} from '@cloudforet/mirinae';

import { useFormValidator } from '@/common/composables/form-validator';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { useCategoryField } from '@/services/ops-flow/composables/use-category-field';
import { useTaskStatusField } from '@/services/ops-flow/composables/use-task-status-field';
import { useTaskTypeField } from '@/services/ops-flow/composables/use-task-type-field';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';
import { useTaskCreatePageStore } from '@/services/ops-flow/stores/task-create-page-store';

const emit = defineEmits<{(event: 'update:is-valid', value: boolean): void;
}>();

const taskCreatePageStore = useTaskCreatePageStore();
const taskCreatePageGetters = taskCreatePageStore.getters;
const taskCategoryStore = useTaskCategoryStore();

/* category */
const {
    selectedCategoryItems,
    categoryValidator,
    categoryMenuItemsHandler,
    setInitialCategories,
} = useCategoryField({
    isRequired: true,
    hasTaskTypeOnly: true,
});
const handleUpdateSelectedCategory = (items) => {
    taskCreatePageStore.setCurrentCategoryId(items[0].name);
    // watcher automatically updates forms
};

/* task type */
const {
    selectedTaskTypeItems,
    taskTypeValidator,
    taskTypeMenuItemsHandler,
    setInitialTaskType,
} = useTaskTypeField({
    categoryId: computed(() => taskCreatePageGetters.currentCategory?.category_id),
});
const handleUpdateSelectedTaskType = (items) => {
    taskCreatePageStore.setCurrentTaskTypeId(items[0].name);
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
    categoryId: computed(() => taskCreatePageGetters.currentCategory?.category_id),
});

/* form */
const {
    forms: { assignee },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
    resetValidations,
} = useFormValidator({
    category: categoryValidator,
    taskType: taskTypeValidator,
    status: taskStatusValidator,
    assignee: '',
}, {
    assignee(value) {
        if (!taskCreatePageGetters.currentCategory || !taskCreatePageGetters.currentTaskType) return true;
        if (!value) return 'Assignee is required';
        return true;
    },
});

/* initiate and update automatically by related fields */
watch([
    () => taskCategoryStore.getters.loading,
    () => taskCreatePageGetters.currentCategory,
], async ([loading, currentCategory]) => {
    if (loading) return;
    if (currentCategory) {
        // init selected category
        setInitialCategories([currentCategory.category_id]);
        // init selected task type
        setInitialTaskType();
        // init selected status
        const defaultStatus = currentCategory.status_options.TODO.find((status) => status.is_default);
        setInitialStatus(defaultStatus);
        // init selected assignee
        setForm('assignee', '');
    }
    resetValidations();
}, { immediate: true });
watch(() => taskCreatePageGetters.currentTaskType, (currentTaskType) => {
    if (currentTaskType) {
        // init selected task type
        setInitialTaskType(currentTaskType.task_type_id);
        // init selected assignee
        setForm('assignee', '');
    }
    resetValidations();
}, { immediate: true });

/* validation event */
watch(isAllValid, (isValid) => {
    emit('update:is-valid', isValid);
}, { immediate: true });

</script>

<template>
    <p-pane-layout class="py-6 px-4 flex flex-wrap gap-4">
        <div class="base-form-top-wrapper">
            <div class="base-form-field-wrapper">
                <p-field-group label="Category"
                               style-type="secondary"
                               required
                               :invalid="invalidState.category"
                               :invalid-text="invalidTexts.category"
                >
                    <p-select-dropdown :selected="selectedCategoryItems"
                                       :handler="categoryMenuItemsHandler"
                                       :invalid="invalidState.category"
                                       block
                                       @update:selected="handleUpdateSelectedCategory"
                    />
                </p-field-group>
            </div>
            <div class="base-form-field-wrapper">
                <p-field-group label="Type"
                               style-type="secondary"
                               required
                               :invalid="invalidState.taskType"
                               :invalid-text="invalidTexts.taskType"
                >
                    <p-select-dropdown :selected="selectedTaskTypeItems"
                                       :handler="taskTypeMenuItemsHandler"
                                       :invalid="invalidState.taskType"
                                       :disabled="!taskCreatePageGetters.currentCategory"
                                       block
                                       @update:selected="handleUpdateSelectedTaskType"
                    />
                </p-field-group>
            </div>
        </div>
        <div class="base-form-top-wrapper">
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
                                       :disabled="!taskCreatePageGetters.currentCategory"
                                       block
                                       @update:selected="setSelectedStatusItems"
                    />
                </p-field-group>
            </div>
            <div class="base-form-field-wrapper">
                <!--                <div class="flex gap-2">-->
                <!--                    <p-field-title size="md"-->
                <!--                                   color="gray"-->
                <!--                    >-->
                <!--                        Assign to-->
                <!--                    </p-field-title>-->
                <!--                </div>-->
                <p-field-group label="Assign to"
                               style-type="secondary"
                               required
                               :invalid="invalidState.assignee"
                               :invalid-text="invalidTexts.assignee"
                >
                    <user-select-dropdown :user-id="assignee"
                                          :invalid="invalidState.assignee"
                                          :disabled="!taskCreatePageGetters.currentTaskType"
                                          @update:user-id="setForm('assignee', $event)"
                    />
                </p-field-group>
            </div>
        </div>
    </p-pane-layout>
</template>

<style scoped lang="postcss">
.base-form-top-wrapper {
    @apply flex-1 flex mobile:flex-wrap gap-4;
}
.base-form-field-wrapper {
    @apply flex-1 min-w-40 mobile:min-w-full flex flex-col gap-1;
}
</style>
