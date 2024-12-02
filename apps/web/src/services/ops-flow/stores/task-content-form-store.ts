import { reactive, computed } from 'vue';

import { isEmpty } from 'lodash';
import { defineStore } from 'pinia';

import type { TaskField } from '@/schema/opsflow/_types/task-field-type';
import type { TaskCategoryModel } from '@/schema/opsflow/task-category/model';
import type { TaskTypeModel } from '@/schema/opsflow/task-type/model';

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
    currentTaskTypeId?: string;
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
        currentTaskTypeId: undefined,
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
        isDefaultFieldValid: computed<boolean>(() => taskFieldMetadataStore.getters.defaultFields.every((field) => state.defaultDataValidationMap[field.field_id])),
        isFieldValid: computed<boolean>(() => getters.currentFields?.every((field) => state.dataValidationMap[field.field_id]) ?? true),
        // overall
        isAllValid: computed<boolean>(() => state.isBaseFormValid && getters.isDefaultFieldValid && getters.isFieldValid),
    } as unknown as UseTaskCreatePageStoreGetters; // HACK: to avoid type error
    const actions = {
        setCurrentCategoryId(categoryId?: string) {
            if (state.currentCategoryId === categoryId) return;
            state.currentCategoryId = categoryId;
            state.currentTaskTypeId = undefined;
        },
        setCurrentTaskTypeId(taskTypeId?: string) {
            if (state.currentTaskTypeId === taskTypeId) return;
            state.currentTaskTypeId = taskTypeId;
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
                state.createTaskLoading = true;
                await taskStore.create({
                    task_type_id: state.currentTaskTypeId as string,
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
