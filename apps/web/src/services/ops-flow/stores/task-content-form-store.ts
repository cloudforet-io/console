import { reactive, computed } from 'vue';

import { isEmpty } from 'lodash';
import { defineStore } from 'pinia';

import type { TaskField } from '@/schema/opsflow/_types/task-field-type';
import type { TaskCategoryModel } from '@/schema/opsflow/task-category/model';
import type { TaskTypeModel } from '@/schema/opsflow/task-type/model';
import type { TaskModel } from '@/schema/opsflow/task/model';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';
import { useTaskStore } from '@/services/ops-flow/stores/task-store';
import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';
import {
    useTaskFieldMetadataStore,
} from '@/services/ops-flow/task-fields-configuration/stores/use-task-field-metadata-store';
import type { DefaultTaskFieldId } from '@/services/ops-flow/task-fields-configuration/types/task-field-type-metadata-type';

interface UseTaskCreatePageStoreState {
    // base form
    currentCategoryId?: string;
    statusId?: string;
    assignee?: string;
    isBaseFormValid: boolean;
    // default field form
    defaultData: Partial<Record<DefaultTaskFieldId, any>>;
    defaultDataValidationMap: Record<string, boolean>;
    // task type field form
    data: Record<string, any>;
    dataValidationMap: Record<string, boolean>;
    // overall
    mode: 'create-minimal'|'create'|'edit'|'view'; // create-minimal: create task without status and assignee
    hasUnsavedChanges: boolean;
    createTaskLoading: boolean;
}
interface UseTaskCreatePageStoreGetters {
    currentCategory: TaskCategoryModel|undefined;
    currentTaskType: TaskTypeModel|undefined;
    currentFields: TaskField[];
    isDefaultFieldValid: boolean;
    isFieldValid: boolean;
    isAllValid: boolean;
}
export const useTaskContentFormStore = defineStore('task-content-form', () => {
    const taskCategoryStore = useTaskCategoryStore();
    const taskTypeStore = useTaskTypeStore();
    const taskStore = useTaskStore();
    const taskFieldMetadataStore = useTaskFieldMetadataStore();

    const state = reactive<UseTaskCreatePageStoreState>({
        // base form
        currentCategoryId: undefined,
        currentTaskType: undefined,
        statusId: undefined,
        assignee: undefined,
        isBaseFormValid: false,
        // default field form
        defaultData: {},
        defaultDataValidationMap: {},
        // task type field form
        data: {},
        dataValidationMap: {},
        // overall
        mode: 'create',
        hasUnsavedChanges: false,
        createTaskLoading: false,
    });
    const getters = {
        // base form
        currentCategory: computed<TaskCategoryModel|undefined>(() => taskCategoryStore.getters.taskCategories.find((c) => c.category_id === state.currentCategoryId)),
        // task type field form
        currentFields: computed<TaskField[]>(() => {
            const taskType = getters.currentTaskType;
            return taskType ? taskType.fields : [];
        }),
        isDefaultFieldValid: computed<boolean>(() => taskFieldMetadataStore.getters.defaultFields.every((field) => state.defaultDataValidationMap[field.field_id])),
        isFieldValid: computed<boolean>(() => getters.currentFields?.every((field) => state.dataValidationMap[field.field_id]) ?? true),
        // overall
        isAllValid: computed<boolean>(() => state.isBaseFormValid && getters.isDefaultFieldValid && getters.isFieldValid),
    } as unknown as UseTaskCreatePageStoreGetters; // HACK: to avoid type error
    const actions = {
        setCurrentCategoryId(categoryId?: string) {
            if (state.currentCategoryId === categoryId) return;
            state.currentCategoryId = categoryId;
            state.currentTaskType = undefined;
        },
        async setCurrentTaskType(taskTypeId?: string) {
            if (state.currentTaskType?.task_type_id === taskTypeId) return;
            if (taskTypeId) {
                if (taskTypeStore.state.fullFieldsItemMap[taskTypeId]) {
                    state.currentTaskType = taskTypeStore.state.fullFieldsItemMap[taskTypeId];
                } else {
                    state.currentTaskType = await taskTypeStore.getWithFullFields({
                        task_type_id: taskTypeId,
                    });
                }
            } else {
                state.currentTaskType = undefined;
            }
            state.data = {};
            state.dataValidationMap = {};
        },
        setStatusId(statusId?: string) {
            state.statusId = statusId;
        },
        setAssignee(assignee?: string) {
            state.assignee = assignee;
        },
        setIsBaseFormValid(isValid: boolean) {
            state.isBaseFormValid = isValid;
        },
        // default field form
        setDefaultFieldData(fieldId: DefaultTaskFieldId, value: any) {
            state.defaultData[fieldId] = value;
            state.hasUnsavedChanges = true;
        },
        setDefaultFieldValidation(fieldId: DefaultTaskFieldId, isValid: boolean) {
            state.defaultDataValidationMap = { ...state.defaultDataValidationMap, [fieldId]: isValid };
        },
        // task type field form
        setFieldData(fieldId: string, value: any) {
            state.data[fieldId] = value;
            state.hasUnsavedChanges = true;
        },
        setFieldValidation(fieldId: string, isValid: boolean) {
            state.dataValidationMap = { ...state.dataValidationMap, [fieldId]: isValid };
        },
        // overall
        setCurrentTask(task: TaskModel) {
            state.currentCategoryId = task.category_id;
            actions.setCurrentTaskType(task.task_type_id);
            state.statusId = task.status_id;
            state.assignee = task.assignee;
            state.defaultData = {
                title: task.name,
                description: task.description,
                project: task.project_id ? [task.project_id] : undefined,
            };
            state.data = task.data ?? {};
            state.defaultDataValidationMap = {};
            state.dataValidationMap = {};
        },
        resetFieldsForm() {
            state.defaultData = {};
            state.defaultDataValidationMap = {};
            state.data = {};
            state.dataValidationMap = {};
        },
        setMode(mode: 'create-minimal'|'create'|'edit'|'view') {
            state.mode = mode;
        },
        async createTask() {
            try {
                if (!state.currentTaskType) throw new Error('Task type is not selected');
                state.createTaskLoading = true;
                await taskStore.create({
                    task_type_id: state.currentTaskType.task_type_id,
                    name: state.defaultData.title,
                    status_id: state.statusId as string,
                    description: state.defaultData.description || undefined,
                    assignee: state.assignee || undefined,
                    data: isEmpty(state.data) ? undefined : state.data,
                    project_id: state.defaultData.project?.[0],
                });
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
