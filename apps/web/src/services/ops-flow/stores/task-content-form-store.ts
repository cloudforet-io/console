import { reactive, computed, onMounted } from 'vue';

import { isEqual } from 'lodash';
import { defineStore } from 'pinia';


import type { TaskField } from '@/api-clients/opsflow/_types/task-field-type';
import type { TaskTypeModel } from '@/api-clients/opsflow/task-type/schema/model';
import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';

import { useUserStore } from '@/store/user/user-store';

import { useTaskCategoryStore } from '@/services/ops-flow/stores/task-category-store';
import { DEFAULT_FIELD_ID_MAP } from '@/services/ops-flow/task-fields-configuration/constants/default-field-constant';
import type { DefaultTaskFieldId } from '@/services/ops-flow/task-fields-configuration/types/task-field-type-metadata-type';
import type { References } from '@/services/ops-flow/task-fields-form/types/task-field-form-type';

import { useCurrentTaskType } from '../composables/use-current-task-type';
import { useTaskFieldsForm } from '../composables/use-task-fields-form';

interface UseTaskContentFormStoreState {
    originTask?: TaskModel;
    // base form
    currentCategoryId?: string;
    currentTaskTypeId?: string;
    currentTaskType?: TaskTypeModel;
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
    const taskCategoryStore = useTaskCategoryStore();
    const userStore = useUserStore();

    const state = reactive<UseTaskContentFormStoreState>({
        originTask: undefined,
        // base form
        currentCategoryId: undefined,
        currentTaskTypeId: undefined,
        currentTaskType: undefined,
        statusId: undefined,
        assignee: undefined,
        isBaseFormValid: false,
        fileIds: [],
        // overall
        mode: 'create',
        hasFileIdsChanged: false,
    });

    const taskTypeId = computed(() => state.currentTaskType?.task_type_id);
    const { has403Error: isArchivedTask } = useCurrentTaskType({ taskTypeId });

    /* fields form */
    const { currentTaskType } = useCurrentTaskType({ taskTypeId });
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
        isAllValid: computed<boolean>(() => {
            if (state.mode === 'view') return getters.isDefaultFieldValid;
            return state.isBaseFormValid && getters.isDefaultFieldValid && getters.isFieldValid;
        }),
        isEditable: computed<boolean>(() => {
            if (state.mode === 'create' || state.mode === 'create-minimal') return true;
            if (!state.originTask) return true;
            if (isArchivedTask.value) return false;
            if (userStore.getters.isDomainAdmin) return true;
            // if (state.originTask.created_by === userStore.state.userId) return true;
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
            if (state.currentCategoryId === categoryId) return;
            state.currentCategoryId = categoryId;
            state.currentTaskTypeId = undefined;
        },
        setCurrentTaskTypeId(typeId?: string) {
            state.currentTaskTypeId = typeId;
        },
        setCurrentTask(task: TaskModel) {
            state.originTask = task;
            state.currentCategoryId = task.category_id;
            actions.setCurrentTaskTypeId(task.task_type_id);
            state.statusId = task.status_id;
            state.assignee = task.assignee;
            initDefaultFieldData(task);
            initFieldData(task);
            state.fileIds = task.files?.map((f) => f.file_id) ?? [];
        },
        // base form
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
