<script setup lang="ts">
import { ref, computed, watch } from 'vue';

import {
    PFieldGroup, PFieldTitle, PSelectDropdown, PPaneLayout,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { TaskStatusOptions } from '@/schema/opsflow/task/type';

import { useFormValidator } from '@/common/composables/form-validator';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { useCategoryField } from '@/services/ops-flow/composables/use-category-field';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';
import { useTaskCreatePageStore } from '@/services/ops-flow/stores/task-create-page-store';
import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';

const emit = defineEmits<{(event: 'update:is-valid', value: boolean): void;
}>();

const taskCreatePageStore = useTaskCreatePageStore();
const taskCreatePageGetters = taskCreatePageStore.getters;
const taskCategoryStore = useTaskCategoryStore();
const taskTypeStore = useTaskTypeStore();

/* category */
const {
    loadingCategories,
    selectedCategoryItems,
    categoryValidator,
    categoryMenuItemsHandler,
    setSelectedCategoryItems,
} = useCategoryField({
    isRequired: true,
    hasTaskTypeOnly: true,
});

/* task type */
const selectedTaskTypeItem = ref<SelectDropdownMenuItem[]>([]);
const allTaskTypeItems = ref<SelectDropdownMenuItem[]>([]);

/* status */
const selectedStatusItem = ref<SelectDropdownMenuItem[]>([]);
const allStatusItems = computed<SelectDropdownMenuItem[]>(() => {
    if (!taskCreatePageGetters.currentCategory) return [];
    const statusOptions: TaskStatusOptions = taskCreatePageGetters.currentCategory?.status_options ?? {
        TODO: [],
        IN_PROGRESS: [],
        COMPLETED: [],
    };
    const items: SelectDropdownMenuItem[] = [];
    items.push({ type: 'header', label: 'To do', name: 'todo' });
    items.push({ type: 'divider', name: 'todo-div' });
    statusOptions.TODO.forEach((status) => {
        items.push({ name: status.status_id, label: status.name });
    });
    items.push({ type: 'header', label: 'In progress', name: 'in-porgress' });
    items.push({ type: 'divider', name: 'in-porgress-div' });
    statusOptions.IN_PROGRESS.forEach((status) => {
        items.push({ name: status.status_id, label: status.name });
    });
    items.push({ type: 'header', label: 'Completed', name: 'completed' });
    items.push({ type: 'divider', name: 'completed-div' });
    statusOptions.COMPLETED.forEach((status) => {
        items.push({ name: status.status_id, label: status.name });
    });
    return items;
});

/* form */
const {
    forms: { assignee },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    category: categoryValidator,
    assignee: '',
}, {
    assignee(value) {
        if (!value) return 'Assignee is required';
        return true;
    },
});

/* initiate form */
watch([
    () => taskCategoryStore.getters.loading,
    () => taskCreatePageGetters.currentCategory,
], async ([loading, currentCategory]) => {
    if (loading) return;
    if (currentCategory) {
        // init selected category
        setSelectedCategoryItems([{
            name: currentCategory.category_id,
            label: currentCategory.name,
            packageId: currentCategory.package_id,
        }]);
        // init task type
        const taskTypes = await taskTypeStore.listByCategoryId(currentCategory.category_id);
        allTaskTypeItems.value = taskTypes.map((taskType) => ({
            name: taskType.task_type_id,
            label: taskType.name,
        }));
        if (taskCreatePageGetters.currentTaskType) {
            selectedTaskTypeItem.value = [{
                name: taskCreatePageGetters.currentTaskType.task_type_id,
                label: taskCreatePageGetters.currentTaskType.name,
            }];
        } else {
            selectedTaskTypeItem.value = allTaskTypeItems.value.length ? [allTaskTypeItems.value[0]] : [];
        }

        // init status
        const defaultStatus = currentCategory.status_options.TODO.find((status) => status.is_default);
        if (defaultStatus) {
            selectedStatusItem.value = [{
                name: defaultStatus.status_id,
                label: defaultStatus.name,
            }];
        }
    }
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
                                       :loading="loadingCategories"
                                       :invalid="invalidState.category"
                                       block
                                       @update:selected="setSelectedCategoryItems"
                    />
                </p-field-group>
            </div>
            <div class="base-form-field-wrapper">
                <p-field-title size="md"
                               color="gray"
                >
                    Type
                </p-field-title>
                <p-select-dropdown :selected="selectedTaskTypeItem"
                                   :menu="allTaskTypeItems"
                                   :loading="taskCategoryStore.getters.loading"
                                   @update:selected="selectedTaskTypeItem = $event"
                />
            </div>
        </div>
        <div class="base-form-top-wrapper">
            <div class="base-form-field-wrapper">
                <p-field-title size="md"
                               color="gray"
                >
                    Status
                </p-field-title>
                <p-select-dropdown :selected="selectedStatusItem"
                                   :menu="allStatusItems"
                                   :loading="taskCategoryStore.getters.loading"
                                   @update:selected="selectedStatusItem = $event"
                />
            </div>
            <div class="base-form-field-wrapper">
                <div class="flex gap-2">
                    <p-field-title size="md"
                                   color="gray"
                    >
                        Assign to
                    </p-field-title>
                </div>
                <user-select-dropdown :user-id="assignee"
                                      @update:user-id="setForm('assignee', $event)"
                />
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
