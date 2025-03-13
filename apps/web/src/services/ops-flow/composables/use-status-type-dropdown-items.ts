import { computed } from 'vue';

import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { TaskStatusType } from '@/api-clients/opsflow/task/schema/type';

import { TASK_STATUS_LABELS } from '@/services/ops-flow/constants/task-status-label-constant';


interface StatusTypeDropdownItem extends SelectDropdownMenuItem {
    name: TaskStatusType;
}
export const useStatusTypeDropdownItems = () => {
    // NOTE: It's not discussed that this is a computed property or not for i18n.
    // But leaved it as it is for now for less change.
    const statusTypeItems = computed<StatusTypeDropdownItem[]>(() => [
        { label: TASK_STATUS_LABELS.TODO, name: 'TODO' },
        { label: TASK_STATUS_LABELS.IN_PROGRESS, name: 'IN_PROGRESS' },
        { label: TASK_STATUS_LABELS.COMPLETED, name: 'COMPLETED' },
    ]);

    return { statusTypeItems };
};
