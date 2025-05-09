import type { Ref } from 'vue';
import { computed, ref } from 'vue';

import { cloneDeep } from 'lodash';

import type { TaskField } from '@/api-clients/opsflow/_types/task-field-type';
import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';

import { DEFAULT_FIELD_ID_MAP } from '@/services/ops-flow/task-fields-configuration/constants/default-field-constant';
import { useTaskFieldMetadataStore } from '@/services/ops-flow/task-fields-configuration/stores/use-task-field-metadata-store';
import type { DefaultTaskFieldId } from '@/services/ops-flow/task-fields-configuration/types/task-field-type-metadata-type';

import { useCurrentTaskType } from './use-current-task-type';

export const useTaskFieldsForm = ({
    taskTypeId,
    mode,
}: {
  taskTypeId: Ref<string | undefined>;
  mode: Ref<'create'|'view'|'create-minimal'>;
}) => {
    const taskFieldMetadataStore = useTaskFieldMetadataStore();
    const { currentTaskType } = useCurrentTaskType({ taskTypeId });
    const fieldsToShow = computed<TaskField[]>(() => {
        const fields = currentTaskType.value?.fields ?? [];
        const isViewMode = mode.value === 'view';
        // NOTE: is_primary is whether to show the field in the form on create mode
        // is_required is always is_primary
        return isViewMode ? fields : fields.filter((f) => f.is_primary || f.is_required);
    });

    /* Form State */
    const hasUnsavedFieldsChanges = ref(false);
    const resetUnsavedFieldsChanges = () => {
        hasUnsavedFieldsChanges.value = false;
    };

    /* Default Fields */
    const defaultData = ref<Partial<Record<DefaultTaskFieldId, any>>>({});
    const defaultDataValidationMap = ref<Record<string, boolean>>({});
    const defaultFields = computed<TaskField[]>(() => {
        const projectRequired = currentTaskType.value?.require_project;
        if (projectRequired) return taskFieldMetadataStore.getters.projectScopeDefaultFields;
        return taskFieldMetadataStore.getters.workspaceScopeDefaultFields;
    });
    const isDefaultFieldValid = computed<boolean>(() => {
        if (mode.value === 'view') return defaultDataValidationMap.value[DEFAULT_FIELD_ID_MAP.title] ?? true;
        return defaultFields.value.every((field) => defaultDataValidationMap.value[field.field_id]);
    });
    const setDefaultFieldData = (fieldId: string, value: string) => {
        hasUnsavedFieldsChanges.value = defaultData.value[fieldId] !== value;
        defaultData.value = {
            ...defaultData.value,
            [fieldId]: value,
        };
    };
    const setDefaultFieldValidation = (fieldId: string, isValid: boolean) => {
        defaultDataValidationMap.value = {
            ...defaultDataValidationMap.value,
            [fieldId]: isValid,
        };
    };
    const initDefaultFieldData = (task?: TaskModel) => {
        if (task) {
            defaultData.value = {
                [DEFAULT_FIELD_ID_MAP.title]: task.name,
                [DEFAULT_FIELD_ID_MAP.description]: task.description,
                [DEFAULT_FIELD_ID_MAP.project]: task.project_id,
            };
            defaultDataValidationMap.value = {};
        } else {
            defaultData.value = {};
            defaultDataValidationMap.value = {};
        }
    };

    /* Other Fields */
    const data = ref<Record<string, string>>({});
    const dataValidationMap = ref<Record<string, boolean>>({});
    const isFieldValid = computed<boolean>(() => fieldsToShow.value?.every((field) => dataValidationMap.value[field.field_id]) ?? true);
    const setFieldData = (fieldId: string, value: string) => {
        hasUnsavedFieldsChanges.value = data.value[fieldId] !== value;
        data.value = {
            ...data.value,
            [fieldId]: value,
        };
    };
    const setFieldValidation = (fieldId: string, isValid: boolean) => {
        dataValidationMap.value = {
            ...dataValidationMap.value,
            [fieldId]: isValid,
        };
    };
    const initFieldData = (task?: TaskModel) => {
        if (task) {
            data.value = cloneDeep(task.data ?? {});
            dataValidationMap.value = {};
        } else {
            data.value = {};
            dataValidationMap.value = {};
        }
    };

    return {
        fieldsToShow,
        hasUnsavedFieldsChanges,
        resetUnsavedFieldsChanges,
        defaultData,
        defaultFields,
        defaultDataValidationMap,
        isDefaultFieldValid,
        setDefaultFieldData,
        setDefaultFieldValidation,
        initDefaultFieldData,
        data,
        dataValidationMap,
        isFieldValid,
        setFieldData,
        setFieldValidation,
        initFieldData,
    };
};
