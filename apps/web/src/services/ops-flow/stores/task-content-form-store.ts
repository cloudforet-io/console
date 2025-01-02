import { reactive, computed } from 'vue';

import { isEmpty, isEqual } from 'lodash';
import { defineStore } from 'pinia';

import { APIError } from '@cloudforet/core-lib/space-connector/error';

import type { FileModel } from '@/schema/file-manager/model';
import type { TaskField } from '@/schema/opsflow/_types/task-field-type';
import type { TaskCategoryModel } from '@/schema/opsflow/task-category/model';
import type { TaskTypeModel } from '@/schema/opsflow/task-type/model';
import type { TaskModel } from '@/schema/opsflow/task/model';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskAPI } from '@/services/ops-flow/composables/use-task-api';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/task-category-store';
import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';
import { DEFAULT_FIELD_ID_MAP } from '@/services/ops-flow/task-fields-configuration/constants/default-field-constant';
import {
    useTaskFieldMetadataStore,
} from '@/services/ops-flow/task-fields-configuration/stores/use-task-field-metadata-store';
import type { DefaultTaskFieldId } from '@/services/ops-flow/task-fields-configuration/types/task-field-type-metadata-type';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

interface UseTaskContentFormStoreState {
    originTask?: TaskModel;
    isArchivedTask: boolean;
    // base form
    currentCategoryId?: string;
    currentTaskType?: TaskTypeModel;
    statusId?: string;
    assignee?: string;
    isBaseFormValid: boolean;
    // default field form
    defaultData: Partial<Record<DefaultTaskFieldId, any>>;
    defaultDataValidationMap: Record<string, boolean>;
    // task type field form
    data: Record<string, any>;
    dataValidationMap: Record<string, boolean>;
    files: FileModel[];
    // overall
    mode: 'create'|'view';
    hasUnsavedChanges: boolean;
    createTaskLoading: boolean;
}
interface UseTaskContentFormStoreGetters {
    currentCategory: TaskCategoryModel|undefined;
    currentFields: TaskField[];
    defaultFields: TaskField[];
    isDefaultFieldValid: boolean;
    isFieldValid: boolean;
    isAllValid: boolean;
    isEditable: boolean;
}
export const useTaskContentFormStore = defineStore('task-content-form', () => {
    const taskCategoryStore = useTaskCategoryStore();
    const taskTypeStore = useTaskTypeStore();
    const taskFieldMetadataStore = useTaskFieldMetadataStore();
    const taskManagementTemplateStore = useTaskManagementTemplateStore();
    const userStore = useUserStore();

    const state = reactive<UseTaskContentFormStoreState>({
        originTask: undefined,
        isArchivedTask: false,
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
        files: [],
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
            const taskType = state.currentTaskType;
            const fields = taskType?.fields ?? [];
            const isViewMode = state.mode === 'view';
            return isViewMode ? fields : fields.filter((f) => f.is_primary || f.is_required);
        }),
        defaultFields: computed<TaskField[]>(() => {
            const scope = state.currentTaskType?.scope;
            switch (scope) {
            case 'WORKSPACE':
                return taskFieldMetadataStore.getters.workspaceScopeDefaultFields;
            case 'PROJECT':
                return taskFieldMetadataStore.getters.projectScopeDefaultFields;
            default:
                return taskFieldMetadataStore.getters.workspaceScopeDefaultFields;
            }
        }),
        isDefaultFieldValid: computed<boolean>(() => {
            if (state.mode === 'view') return state.defaultDataValidationMap[DEFAULT_FIELD_ID_MAP.title] ?? true;
            return getters.defaultFields.every((field) => state.defaultDataValidationMap[field.field_id]);
        }),
        isFieldValid: computed<boolean>(() => getters.currentFields?.every((field) => state.dataValidationMap[field.field_id]) ?? true),
        // overall
        isAllValid: computed<boolean>(() => {
            if (state.mode === 'view') return getters.isDefaultFieldValid;
            return state.isBaseFormValid && getters.isDefaultFieldValid && getters.isFieldValid;
        }),
        isEditable: computed<boolean>(() => {
            if (state.mode === 'create') return true;
            if (!state.originTask) return true;
            if (state.isArchivedTask) return false;
            if (userStore.getters.isDomainAdmin) return true;
            // if (state.originTask.created_by === userStore.state.userId) return true;
            return false;
        }),
    } as unknown as UseTaskContentFormStoreGetters; // HACK: to avoid type error

    const taskAPI = useTaskAPI();
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
                    try {
                        state.currentTaskType = await taskTypeStore.getWithFullFields(taskTypeId);
                    } catch (e) {
                        if (e instanceof APIError && e.status === 403) {
                            state.isArchivedTask = true;
                        } else {
                            ErrorHandler.handleError(e);
                        }
                    }
                }
            } else {
                state.currentTaskType = undefined;
            }
            state.data = {};
            state.dataValidationMap = {};
            state.files = [];
        },
        setStatusId(statusId?: string) {
            state.statusId = statusId;
        },
        setAssigneeToOriginTask(assignee: string) {
            if (state.originTask) {
                state.originTask = { ...state.originTask, assignee };
            }
        },
        setIsBaseFormValid(isValid: boolean) {
            state.isBaseFormValid = isValid;
        },
        // default field form
        setDefaultFieldData(fieldId: DefaultTaskFieldId, value: any) {
            state.hasUnsavedChanges = state.defaultData[fieldId] !== value;
            state.defaultData[fieldId] = value;
        },
        setDefaultFieldValidation(fieldId: DefaultTaskFieldId, isValid: boolean) {
            state.defaultDataValidationMap = { ...state.defaultDataValidationMap, [fieldId]: isValid };
        },
        // task type field form
        setFieldData(fieldId: string, value: any) {
            state.hasUnsavedChanges = state.data[fieldId] !== value;
            state.data[fieldId] = value;
        },
        setFieldValidation(fieldId: string, isValid: boolean) {
            state.dataValidationMap = { ...state.dataValidationMap, [fieldId]: isValid };
        },
        setFiles(files: FileModel[]) {
            state.hasUnsavedChanges = !isEqual(state.files, files);
            state.files = files;
        },
        // overall
        setCurrentTask(task: TaskModel) {
            state.originTask = task;
            state.currentCategoryId = task.category_id;
            actions.setCurrentTaskType(task.task_type_id);
            state.statusId = task.status_id;
            state.assignee = task.assignee;
            state.defaultData = {
                [DEFAULT_FIELD_ID_MAP.title]: task.name,
                [DEFAULT_FIELD_ID_MAP.description]: task.description,
                [DEFAULT_FIELD_ID_MAP.project]: task.project_id ? [task.project_id] : undefined,
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
            state.files = [];
        },
        setMode(mode: 'create'|'view') {
            state.mode = mode;
        },
        async createTask(): Promise<TaskModel|undefined> {
            try {
                if (!state.currentTaskType) throw new Error('Task type is not selected');
                state.createTaskLoading = true;
                state.originTask = await taskAPI.create({
                    task_type_id: state.currentTaskType.task_type_id,
                    name: state.defaultData[DEFAULT_FIELD_ID_MAP.title],
                    status_id: state.statusId as string,
                    description: state.defaultData[DEFAULT_FIELD_ID_MAP.description] || undefined,
                    assignee: state.assignee || undefined,
                    data: isEmpty(state.data) ? undefined : state.data,
                    files: state.files.map((f) => f.file_id),
                    project_id: state.defaultData[DEFAULT_FIELD_ID_MAP.project]?.[0],
                    resource_group: state.currentTaskType.scope,
                });
                showSuccessMessage(i18n.t('OPSFLOW.ALT_S_CREATE_TARGET', { target: taskManagementTemplateStore.templates.task }), '');
                state.createTaskLoading = false;
                return state.originTask;
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('OPSFLOW.ALT_E_CREATE_TARGET', { target: taskManagementTemplateStore.templates.task }));
                state.createTaskLoading = false;
                return undefined;
            }
        },
        async updateTask() {
            try {
                if (!state.originTask) throw new Error('Origin task is not defined');
                await taskAPI.update({
                    task_id: state.originTask.task_id,
                    name: state.defaultData[DEFAULT_FIELD_ID_MAP.title],
                });
                showSuccessMessage(i18n.t('OPSFLOW.ALT_S_UPDATE_TARGET', { target: taskManagementTemplateStore.templates.task }), '');
                return true;
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('OPSFLOW.ALT_E_UPDATE_TARGET', { target: taskManagementTemplateStore.templates.task }));
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
