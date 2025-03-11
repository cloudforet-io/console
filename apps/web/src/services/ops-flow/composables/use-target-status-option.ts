import type { Ref } from 'vue';
import { computed } from 'vue';

import type { TaskStatusOption, TaskStatusOptions, TaskStatusType } from '@/api-clients/opsflow/task/schema/type';

export const useTargetStatusOption = ({
    categoryStatusOptions, targetStatusType, targetStatusId,
}: {
  categoryStatusOptions: Ref<TaskStatusOptions|undefined>;
  // status options are identified by status type and status id
  targetStatusType: Ref<TaskStatusType | undefined>;
  targetStatusId: Ref<string | undefined>;
}) => {
    const targetStatusOption = computed<TaskStatusOption|undefined>(() => {
        if (!targetStatusType.value || !targetStatusId.value) return undefined;
        if (!categoryStatusOptions.value) return undefined;
        const data = categoryStatusOptions.value[targetStatusType.value].find((status) => status.status_id === targetStatusId.value);
        if (!data) return undefined;
        return data;
    });

    return { targetStatusOption };
};
