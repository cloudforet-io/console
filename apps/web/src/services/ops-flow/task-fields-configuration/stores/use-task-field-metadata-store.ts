import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { defineStore } from 'pinia';

import type { TaskField, TaskFieldType } from '@/api-clients/opsflow/_types/task-field-type';
import { i18n } from '@/translations';

import { DEFAULT_FIELD_ID_MAP } from '@/services/ops-flow/task-fields-configuration/constants/default-field-constant';
import type { TaskFieldTypeMetadata } from '@/services/ops-flow/task-fields-configuration/types/task-field-type-metadata-type';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

interface UseTaskFieldMetadataGetters {
    taskFieldTypeMetadataMap: ComputedRef<Record<TaskFieldType, TaskFieldTypeMetadata>>;
    taskFieldTypeMetadataList: ComputedRef<TaskFieldTypeMetadata[]>;
    workspaceScopeDefaultFields: ComputedRef<TaskField[]>;
    projectScopeDefaultFields: ComputedRef<TaskField[]>;
    allDefaultFields: ComputedRef<TaskField[]>;
}
export const useTaskFieldMetadataStore = defineStore('task-field-metadata', () => {
    const taskManagementTemplateStore = useTaskManagementTemplateStore();
    const taskFieldTypeMetadataMap = computed<Record<TaskFieldType, TaskFieldTypeMetadata>>(() => ({
        GLOBAL: { type: 'GLOBAL', name: i18n.t('OPSFLOW.FIELD_GENERATOR.GLOBAL') as string, icon: 'ic_global' }, // not used yet
        TEXT: { type: 'TEXT', name: i18n.t('OPSFLOW.FIELD_GENERATOR.TEXT') as string, icon: 'ic_short-text' },
        PARAGRAPH: { type: 'PARAGRAPH', name: i18n.t('OPSFLOW.FIELD_GENERATOR.PARAGRAPH') as string, icon: 'ic_paragraph' },
        LABELS: { type: 'LABELS', name: i18n.t('OPSFLOW.FIELD_GENERATOR.LABELS') as string, icon: 'ic_label' },
        DROPDOWN: { type: 'DROPDOWN', name: i18n.t('OPSFLOW.FIELD_GENERATOR.DROPDOWN') as string, icon: 'ic_dropdown' },
        DATE: { type: 'DATE', name: i18n.t('OPSFLOW.FIELD_GENERATOR.DATE') as string, icon: 'ic_calendar' },
        USER: { type: 'USER', name: i18n.t('OPSFLOW.FIELD_GENERATOR.USER') as string, icon: 'ic_member' },
        ASSET: { type: 'ASSET', name: i18n.t('OPSFLOW.FIELD_GENERATOR.ASSET') as string, icon: 'ic_service_asset-inventory' },
        PROJECT: { type: 'PROJECT', name: i18n.t('OPSFLOW.FIELD_GENERATOR.PROJECT') as string, icon: 'ic_service_project' },
        PROVIDER: { type: 'PROVIDER', name: i18n.t('OPSFLOW.FIELD_GENERATOR.PROVIDER') as string, icon: 'ic_service_provider' }, // not used yet
        SERVICE_ACCOUNT: { type: 'SERVICE_ACCOUNT', name: i18n.t('OPSFLOW.FIELD_GENERATOR.SERVICE_ACCOUNT') as string, icon: 'ic_service_service-account' }, // not used yet
    }));
    const taskFieldTypeMetadataList = computed<TaskFieldTypeMetadata[]>(() => [
        taskFieldTypeMetadataMap.value.TEXT,
        taskFieldTypeMetadataMap.value.PARAGRAPH,
        taskFieldTypeMetadataMap.value.LABELS,
        taskFieldTypeMetadataMap.value.DROPDOWN,
        taskFieldTypeMetadataMap.value.DATE,
        taskFieldTypeMetadataMap.value.PROJECT,
        taskFieldTypeMetadataMap.value.ASSET,
    ]);
    const allDefaultFields = computed<TaskField[]>(() => [
        {
            field_id: DEFAULT_FIELD_ID_MAP.title,
            name: i18n.t('OPSFLOW.TITLE') as string,
            field_type: 'TEXT',
            is_required: true,
            is_primary: true,
            options: {
                example: i18n.t('OPSFLOW.FIELD_GENERATOR.TASK_TITLE', { task: taskManagementTemplateStore.templates.Task }) as string,
                max_length: 100,
            },
        },
        {
            field_id: DEFAULT_FIELD_ID_MAP.project,
            name: i18n.t('OPSFLOW.FIELD_GENERATOR.PROJECT') as string,
            field_type: 'PROJECT',
            selection_type: 'SINGLE',
            is_required: true,
            is_primary: true,
            options: {
                match_pattern: '^project-',
            },
        },
        {
            field_id: DEFAULT_FIELD_ID_MAP.description,
            name: i18n.t('OPSFLOW.DESCRIPTION') as string,
            field_type: 'PARAGRAPH',
            is_required: false,
            is_primary: true,
            options: {
                example: i18n.t('OPSFLOW.FIELD_GENERATOR.TASK_DESCRIPTION', { task: taskManagementTemplateStore.templates.Task }) as string,
            },
        },
    ] as TaskField[]);
    const workspaceScopeDefaultFields = computed<TaskField[]>(() => allDefaultFields.value.filter((field) => field.field_id !== DEFAULT_FIELD_ID_MAP.project));
    const getters: UseTaskFieldMetadataGetters = {
        taskFieldTypeMetadataMap,
        taskFieldTypeMetadataList,
        workspaceScopeDefaultFields,
        projectScopeDefaultFields: allDefaultFields,
        allDefaultFields,
    };

    return {
        getters,
    };
});
