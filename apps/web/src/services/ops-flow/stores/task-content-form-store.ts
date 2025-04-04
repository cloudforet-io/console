import { reactive, computed } from 'vue';

import { isEqual } from 'lodash';
import { defineStore } from 'pinia';

import { APIError } from '@cloudforet/core-lib/space-connector/error';

import type { TaskField } from '@/api-clients/opsflow/_types/task-field-type';
import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';

import { useCategoryQuery } from '@/services/ops-flow/composables/use-current-category';
import { useCurrentTaskType } from '@/services/ops-flow/composables/use-current-task-type';
import { useTaskFieldsForm } from '@/services/ops-flow/composables/use-task-fields-form';
import { useTaskQuery } from '@/services/ops-flow/composables/use-task-query';
import { DEFAULT_FIELD_ID_MAP } from '@/services/ops-flow/task-fields-configuration/constants/default-field-constant';
import type { DefaultTaskFieldId } from '@/services/ops-flow/task-fields-configuration/types/task-field-type-metadata-type';
import type { References } from '@/services/ops-flow/task-fields-form/types/task-field-form-type';


interface UseTaskContentFormStoreState {
    // base form
    currentCategoryId?: string;
    currentTaskTypeId?: string;
    currentTaskId?: string;
    statusId?: string;
    assignee?: string;
    isBaseFormValid: boolean;
    fileIds: string[]; // for file upload
    // overall
    mode: 'create'|'view'|'create-minimal';
    hasFileIdsChanged: boolean;
}
interface UseTaskContentFormStoreGetters {
    defaultData: Partial<Record<DefaultTaskFieldId, any>>;
    data: Record<string, any>;
    defaultFields: TaskField[];
    fieldsToShow: TaskField[];
    isDefaultFieldValid: boolean;
    isFieldValid: boolean;
    isAllValid: boolean;
    isEditable: boolean;
    references: References;
    hasUnsavedChanges: boolean;
    isArchivedTask: boolean;
}
export const useTaskContentFormStore = defineStore('task-content-form', () => {
    const state = reactive<UseTaskContentFormStoreState>({
        // base form
        currentCategoryId: undefined,
        currentTaskTypeId: undefined,
        currentTaskId: undefined,
        statusId: undefined,
        assignee: undefined,
        isBaseFormValid: false,
        fileIds: [],
        // overall
        mode: 'create',
        hasFileIdsChanged: false,
    });

    /* current category */
    const { error: categoryError, data: currentCategory } = useCategoryQuery({ categoryId: computed(() => state.currentCategoryId) });
    const isArchivedTask = computed(() => (categoryError.value instanceof APIError && categoryError.value.status === 403) || currentCategory.value?.state === 'DELETED');

    /* fields form */
    const taskTypeId = computed(() => state.currentTaskTypeId);
    const { currentTaskType } = useCurrentTaskType({ taskTypeId });
    const { data: currentTask } = useTaskQuery({ taskId: computed(() => state.currentTaskId) });
    const {
        fieldsToShow,
        hasUnsavedFieldsChanges,
        resetUnsavedFieldsChanges,
        defaultData,
        defaultFields,
        isDefaultFieldValid,
        setDefaultFieldData,
        setDefaultFieldValidation,
        initDefaultFieldData,
        data,
        isFieldValid,
        setFieldData,
        setFieldValidation,
        initFieldData,
    } = useTaskFieldsForm({ taskTypeId, mode: computed(() => state.mode) });

    const getters = {
        // task type field form
        fieldsToShow,
        defaultFields,
        isDefaultFieldValid,
        isFieldValid,
        defaultData,
        data,
        // overall
        isArchivedTask,
        isAllValid: computed<boolean>(() => {
            if (state.mode === 'view') return getters.isDefaultFieldValid;
            return state.isBaseFormValid && getters.isDefaultFieldValid && getters.isFieldValid;
        }),
        isEditable: computed<boolean>(() => {
            if (state.mode === 'create' || state.mode === 'create-minimal') return true;
            if (isArchivedTask.value) return false;
            if (currentTask.value?.status_type === 'TODO') return true;
            return false;
        }),
        references: computed<References>(() => {
            const projectRequired = currentTaskType.value?.require_project;
            return {
                project_id: projectRequired ? defaultData.value[DEFAULT_FIELD_ID_MAP.project] : '*',
            };
        }),
        hasUnsavedChanges: computed<boolean>(() => hasUnsavedFieldsChanges.value || state.hasFileIdsChanged),
    } as unknown as UseTaskContentFormStoreGetters; // HACK: to avoid type error

    const actions = {
        setCurrentCategoryId(categoryId?: string) {
            state.currentCategoryId = categoryId;
        },
        setCurrentTaskTypeId(typeId?: string) {
            state.currentTaskTypeId = typeId;
        },
        setCurrentTaskId(taskId?: string) {
            state.currentTaskId = taskId;
        },
        // base form
        setStatusId(statusId?: string) {
            state.statusId = statusId;
        },
        setIsBaseFormValid(isValid: boolean) {
            state.isBaseFormValid = isValid;
        },
        // fields form
        setDefaultFieldData,
        setDefaultFieldValidation,
        setFieldData,
        setFieldValidation,
        // file
        setFileIds(fileIds: string[]) {
            state.hasFileIdsChanged = !isEqual(state.fileIds, fileIds);
            state.fileIds = fileIds;
        },
        // overall
        setMode(mode: 'create'|'view'|'create-minimal') {
            state.mode = mode;
        },
        resetFieldsForm() {
            initDefaultFieldData();
            initFieldData();
            state.fileIds = [];
        },
        resetUnsavedChanges() {
            resetUnsavedFieldsChanges();
            state.hasFileIdsChanged = false;
        },
        reset(task: TaskModel) {
            state.currentCategoryId = task.category_id;
            state.currentTaskTypeId = task.task_type_id;
            state.currentTaskId = task.task_id;
            state.statusId = task.status_id;
            state.assignee = task.assignee;
            initDefaultFieldData(task);
            initFieldData(task);
            state.fileIds = task.files?.map((f) => f.file_id) ?? [];
            actions.resetUnsavedChanges();
        },
    };

    return {
        state,
        getters,
        ...actions,
    };
});
