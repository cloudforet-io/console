import { reactive, computed, onMounted } from 'vue';

import { isEqual } from 'lodash';
import { defineStore } from 'pinia';

import { APIError } from '@cloudforet/core-lib/space-connector/error';

import type { TaskField } from '@/api-clients/opsflow/_types/task-field-type';
import type { TaskCategoryModel } from '@/api-clients/opsflow/task-category/schema/model';
import type { TaskTypeModel } from '@/api-clients/opsflow/task-type/schema/model';
import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';

import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskCategoryStore } from '@/services/ops-flow/stores/task-category-store';
import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';
import { DEFAULT_FIELD_ID_MAP } from '@/services/ops-flow/task-fields-configuration/constants/default-field-constant';
import {
    useTaskFieldMetadataStore,
} from '@/services/ops-flow/task-fields-configuration/stores/use-task-field-metadata-store';
import type { DefaultTaskFieldId } from '@/services/ops-flow/task-fields-configuration/types/task-field-type-metadata-type';
import type { References } from '@/services/ops-flow/task-fields-form/types/task-field-form-type';

interface UseTaskContentFormStoreState {
    originTask?: TaskModel;
    isArchivedTask: boolean;
    // base form
    currentCategoryId?: string;
    currentTaskType?: TaskTypeModel;
    hasTaskTypeLoaded: boolean;
    statusId?: string;
    assignee?: string;
    isBaseFormValid: boolean;
    // default field form
    defaultData: Partial<Record<DefaultTaskFieldId, any>>;
    defaultDataValidationMap: Record<string, boolean>;
    // task type field form
    data: Record<string, any>;
    dataValidationMap: Record<string, boolean>;
    fileIds: string[]; // for file upload
    // overall
    mode: 'create'|'view'|'create-minimal';
    hasUnsavedChanges: boolean;
}
interface UseTaskContentFormStoreGetters {
    currentCategory: TaskCategoryModel|undefined;
    currentFields: TaskField[];
    defaultFields: TaskField[];
    isDefaultFieldValid: boolean;
    isFieldValid: boolean;
    isAllValid: boolean;
    isEditable: boolean;
    references: References;
}
export const useTaskContentFormStore = defineStore('task-content-form', () => {
    const taskCategoryStore = useTaskCategoryStore();
    const taskTypeStore = useTaskTypeStore();
    const taskFieldMetadataStore = useTaskFieldMetadataStore();
    const userStore = useUserStore();

    const state = reactive<UseTaskContentFormStoreState>({
        originTask: undefined,
        isArchivedTask: false,
        // base form
        currentCategoryId: undefined,
        currentTaskType: undefined,
        hasTaskTypeLoaded: false,
        statusId: undefined,
        assignee: undefined,
        isBaseFormValid: false,
        // default field form
        defaultData: {},
        defaultDataValidationMap: {},
        // task type field form
        data: {},
        dataValidationMap: {},
        fileIds: [],
        // overall
        mode: 'create',
        hasUnsavedChanges: false,
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
            const projectRequired = state.currentTaskType?.require_project;
            if (projectRequired) return taskFieldMetadataStore.getters.projectScopeDefaultFields;
            return taskFieldMetadataStore.getters.workspaceScopeDefaultFields;
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
            if (state.mode === 'create' || state.mode === 'create-minimal') return true;
            if (!state.originTask) return true;
            if (state.isArchivedTask) return false;
            if (userStore.getters.isDomainAdmin) return true;
            // if (state.originTask.created_by === userStore.state.userId) return true;
            return false;
        }),
        references: computed<References>(() => {
            const projectRequired = state.currentTaskType?.require_project;
            return {
                project_id: projectRequired ? state.defaultData[DEFAULT_FIELD_ID_MAP.project] : '*',
            };
        }),
    } as unknown as UseTaskContentFormStoreGetters; // HACK: to avoid type error

    const actions = {
        setCurrentCategoryId(categoryId?: string) {
            if (state.currentCategoryId === categoryId) return;
            state.currentCategoryId = categoryId;
            state.currentTaskType = undefined;
        },
        async setCurrentTaskType(taskTypeId?: string) {
            if (state.currentTaskType?.task_type_id === taskTypeId) {
                state.hasTaskTypeLoaded = true;
                return;
            }
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
            if (!state.originTask) {
                state.data = {};
                state.dataValidationMap = {};
            }
            state.hasTaskTypeLoaded = true;
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
        setFileIds(fileIds: string[]) {
            state.hasUnsavedChanges = !isEqual(state.fileIds, fileIds);
            state.fileIds = fileIds;
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
                [DEFAULT_FIELD_ID_MAP.project]: task.project_id,
            };
            state.data = task.data ?? {};
            state.fileIds = task.files?.map((f) => f.file_id) ?? [];
            state.defaultDataValidationMap = {};
            state.dataValidationMap = {};
        },
        resetFieldsForm() {
            state.defaultData = {};
            state.defaultDataValidationMap = {};
            state.data = {};
            state.dataValidationMap = {};
            state.fileIds = [];
        },
        setMode(mode: 'create'|'view'|'create-minimal') {
            state.mode = mode;
        },
        resetUnsavedChanges() {
            state.hasUnsavedChanges = false;
        },
    };

    onMounted(() => {
        if (!taskCategoryStore.state.loading) taskCategoryStore.list();
    });


    return {
        state,
        getters,
        ...actions,
    };
});
