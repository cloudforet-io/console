import type { ComputedRef } from 'vue';
import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import type { TaskField } from '@/schema/opsflow/_types/task-field-type';
import type { TaskCategoryModel } from '@/schema/opsflow/task-category/model';
import type { TaskTypeModel } from '@/schema/opsflow/task-type/model';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';
import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';

interface UseTaskCreatePageStoreGetters {
    currentCategory: ComputedRef<TaskCategoryModel|undefined>;
    currentTaskType: ComputedRef<TaskTypeModel|undefined>;
    currentFields: ComputedRef<TaskField[]>;
    isFieldFormValid: ComputedRef<boolean>;
    isAllValid: ComputedRef<boolean>;
}
export const useTaskContentFormStore = defineStore('task-content-form', () => {
    const taskCategoryStore = useTaskCategoryStore();
    const taskTypeStore = useTaskTypeStore();

    const state = reactive({
        // base form
        currentCategoryId: undefined as string|undefined,
        currentTaskTypeId: undefined as string|undefined,
        statusId: undefined as string|undefined,
        assignee: undefined as string|undefined,
        isBaseFormValid: false,
        // default field form
        name: '',
        isNameValid: false,
        description: '',
        // task type field form
        data: {} as Record<string, any>,
        dataValidationMap: {} as Record<string, boolean>,
        // overall
        mode: 'create' as 'create'|'edit'|'view',
        hasUnsavedChanges: false,
        createTaskLoading: false,
    });
    const getters: UseTaskCreatePageStoreGetters = {
        // base form
        currentCategory: computed<TaskCategoryModel|undefined>(() => taskCategoryStore.getters.taskCategories.find((c) => c.category_id === state.currentCategoryId)),
        currentTaskType: computed<TaskTypeModel|undefined>(() => {
            if (!state.currentCategoryId || !state.currentTaskTypeId) return undefined;
            if (!taskTypeStore.state.itemsByCategoryId[state.currentCategoryId]) {
                taskTypeStore.listByCategoryId(state.currentCategoryId);
            }
            return taskTypeStore.state.itemsByCategoryId[state.currentCategoryId]?.find((t) => t.task_type_id === state.currentTaskTypeId);
        }),
        // task type field form
        currentFields: computed<TaskField[]>(() => {
            const taskType = getters.currentTaskType;
            return taskType ? taskType.fields : [];
        }),
        isFieldFormValid: computed<boolean>(() => state.isNameValid && Object.values(state.dataValidationMap).every((isValid) => isValid)),
        // overall
        isAllValid: computed<boolean>(() => state.isBaseFormValid && getters.isFieldFormValid),
    };
    const actions = {
        setCurrentCategoryId(categoryId?: string) {
            if (state.currentCategoryId === categoryId) return;
            state.currentCategoryId = categoryId;
            state.currentTaskTypeId = undefined;
            state.hasUnsavedChanges = true;
        },
        setCurrentTaskTypeId(taskTypeId?: string) {
            if (state.currentTaskTypeId === taskTypeId) return;
            state.currentTaskTypeId = taskTypeId;
            state.data = {};
            state.dataValidationMap = {};
            state.hasUnsavedChanges = true;
        },
        setStatusId(statusId?: string) {
            state.currentStatusId = statusId;
            state.hasUnsavedChanges = true;
        },
        setAssignee(assignee?: string) {
            state.assignee = assignee;
            state.hasUnsavedChanges = true;
        },
        setIsBaseFormValid(isValid: boolean) {
            state.isBaseFormValid = isValid;
        },
        // default field form
        setName(name: string) {
            state.name = name;
            state.hasUnsavedChanges = true;
        },
        setIsNameValid(isValid: boolean) {
            state.isNameValid = isValid;
        },
        setDescription(description: string) {
            state.description = description;
            state.hasUnsavedChanges = true;
        },
        // task type field form
        setFieldData(fieldId: string, value: any) {
            state.data[fieldId] = value;
            state.hasUnsavedChanges = true;
        },
        resetFieldData() {
            state.data = {};
            state.dataValidationMap = {};
        },
        // overall
        setMode(mode: 'create'|'edit'|'view') {
            state.mode = mode;
        },
        async createTask() {
            try {
                state.createTaskLoading = true;
                // await taskContentFormStore.createTask();
                showSuccessMessage('Task created successfully', '');
                state.createTaskLoading = false;
                return true;
            } catch (e) {
                ErrorHandler.handleRequestError(e, 'Failed to create task');
                state.createTaskLoading = false;
                return false;
            }
        },
    };
    return {
        state,
        getters,
        ...actions,
    };
});
