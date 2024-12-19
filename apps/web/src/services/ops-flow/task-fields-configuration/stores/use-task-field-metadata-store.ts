import { computed } from 'vue';

import { defineStore } from 'pinia';

import type { TaskField, TaskFieldType } from '@/schema/opsflow/_types/task-field-type';
import { i18n } from '@/translations';

import { DEFAULT_FIELD_ID_MAP } from '@/services/ops-flow/task-fields-configuration/constants/default-field-constant';
import type { TaskFieldTypeMetadata } from '@/services/ops-flow/task-fields-configuration/types/task-field-type-metadata-type';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

export const useTaskFieldMetadataStore = defineStore('task-field-metadata', () => {
    const taskManagementTemplateStore = useTaskManagementTemplateStore();
    const getters = {
        taskFieldTypeMetadataMap: computed<Record<TaskFieldType, TaskFieldTypeMetadata>>(() => ({
            GLOBAL: { type: 'GLOBAL', name: i18n.t('OPSFLOW.FIELD_GENERATOR.GLOBAL'), icon: 'ic_global' }, // not used yet
            TEXT: { type: 'TEXT', name: i18n.t('OPSFLOW.FIELD_GENERATOR.TEXT'), icon: 'ic_short-text' },
            PARAGRAPH: { type: 'PARAGRAPH', name: i18n.t('OPSFLOW.FIELD_GENERATOR.PARAGRAPH'), icon: 'ic_paragraph' },
            LABELS: { type: 'LABELS', name: i18n.t('OPSFLOW.FIELD_GENERATOR.LABELS'), icon: 'ic_label' },
            DROPDOWN: { type: 'DROPDOWN', name: i18n.t('OPSFLOW.FIELD_GENERATOR.DROPDOWN'), icon: 'ic_dropdown' },
            DATE: { type: 'DATE', name: i18n.t('OPSFLOW.FIELD_GENERATOR.DATE'), icon: 'ic_calendar' },
            USER: { type: 'USER', name: i18n.t('OPSFLOW.FIELD_GENERATOR.USER'), icon: 'ic_member' },
            ASSET: { type: 'ASSET', name: i18n.t('OPSFLOW.FIELD_GENERATOR.ASSET'), icon: 'ic_service_asset-inventory' },
            PROJECT: { type: 'PROJECT', name: i18n.t('OPSFLOW.FIELD_GENERATOR.PROJECT'), icon: 'ic_service_project' },
            PROVIDER: { type: 'PROVIDER', name: i18n.t('OPSFLOW.FIELD_GENERATOR.PROVIDER'), icon: 'ic_service_provider' }, // not used yet
            SERVICE_ACCOUNT: { type: 'SERVICE_ACCOUNT', name: i18n.t('OPSFLOW.FIELD_GENERATOR.SERVICE_ACCOUNT'), icon: 'ic_service_service-account' }, // not used yet
        })),
        taskFieldTypeMetadataList: computed<TaskFieldTypeMetadata[]>(() => [
            getters.taskFieldTypeMetadataMap.TEXT,
            getters.taskFieldTypeMetadataMap.PARAGRAPH,
            getters.taskFieldTypeMetadataMap.LABELS,
            getters.taskFieldTypeMetadataMap.DROPDOWN,
            getters.taskFieldTypeMetadataMap.DATE,
            getters.taskFieldTypeMetadataMap.ASSET,
            getters.taskFieldTypeMetadataMap.PROJECT,
        ]),
        defaultFields: computed<TaskField[]>(() => [
            {
                field_id: DEFAULT_FIELD_ID_MAP.title,
                name: i18n.t('OPSFLOW.TITLE'),
                field_type: 'TEXT',
                is_required: true,
                is_primary: true,
                options: {
                    example: i18n.t('OPSFLOW.FIELD_GENERATOR.TASK_TITLE', { task: taskManagementTemplateStore.templates.Task }),
                },
            },
            {
                field_id: DEFAULT_FIELD_ID_MAP.project,
                name: i18n.t('OPSFLOW.FIELD_GENERATOR.PROJECT'),
                field_type: 'PROJECT',
                is_required: true,
                is_primary: true,
            },
            {
                field_id: DEFAULT_FIELD_ID_MAP.description,
                name: i18n.t('OPSFLOW.DESCRIPTION'),
                field_type: 'PARAGRAPH',
                is_required: false,
                is_primary: true,
                options: {
                    example: i18n.t('OPSFLOW.FIELD_GENERATOR.TASK_DESCRIPTION', { task: taskManagementTemplateStore.templates.Task }),
                },
            },
        ]),
    };

    return {
        getters,
    };
});
