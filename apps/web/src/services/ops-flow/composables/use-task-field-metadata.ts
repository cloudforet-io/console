import { computed } from 'vue';

import type { TaskField, TaskFieldType } from '@/schema/opsflow/_types/task-field-type';

import getRandomId from '@/lib/random-id-generator';

interface TaskFieldMetadata {
    type: TaskFieldType;
    name: string;
    icon: string;
}

export const useTaskFieldMetadata = () => {
    // TODO: i18n
    const taskFieldMetadataMap = computed<Record<TaskFieldType, TaskFieldMetadata>>(() => ({
        GLOBAL: { type: 'GLOBAL', name: 'Global', icon: 'ic_global' }, // not used yet
        TEXT: { type: 'TEXT', name: 'Short Text', icon: 'ic_short-text' },
        PARAGRAPH: { type: 'PARAGRAPH', name: 'Paragraph', icon: 'ic_paragraph' },
        LABELS: { type: 'LABELS', name: 'Labels', icon: 'ic_label' },
        DROPDOWN: { type: 'DROPDOWN', name: 'Dropdown', icon: 'ic_dropdown' },
        DATE: { type: 'DATE', name: 'Date', icon: 'ic_calendar' },
        USER: { type: 'USER', name: 'User', icon: 'ic_member' },
        ASSET: { type: 'ASSET', name: 'Asset', icon: 'ic_service_asset-inventory' },
        PROJECT: { type: 'PROJECT', name: 'Project', icon: 'ic_service_project' },
    } as Record<TaskFieldType, TaskFieldMetadata>));

    const taskFieldMetadataList = computed<TaskFieldMetadata[]>(() => [
        taskFieldMetadataMap.value.TEXT,
        taskFieldMetadataMap.value.PARAGRAPH,
        taskFieldMetadataMap.value.LABELS,
        taskFieldMetadataMap.value.DROPDOWN,
        taskFieldMetadataMap.value.DATE,
        taskFieldMetadataMap.value.USER,
        taskFieldMetadataMap.value.ASSET,
        taskFieldMetadataMap.value.PROJECT,
    ]);

    const defaultFields = computed<TaskField[]>(() => [
        {
            field_id: getRandomId(),
            name: 'Title', // TODO: i18n
            field_type: 'TEXT',
            is_required: true,
            is_primary: true,
        },
        {
            field_id: getRandomId(),
            name: 'Content', // TODO: i18n
            field_type: 'PARAGRAPH',
            is_required: true,
            is_primary: true,
        },
    ]);
    return {
        taskFieldMetadataMap,
        taskFieldMetadataList,
        defaultFields,
    };
};
