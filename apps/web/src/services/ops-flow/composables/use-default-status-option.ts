import type { Ref } from 'vue';
import { computed } from 'vue';

import type { TaskStatusOption, TaskStatusOptions, TaskStatusType } from '@/api-clients/opsflow/task/schema/type';

export const useDefaultStatusOption = ({
    categoryStatusOptions, targetStatusType,
}: {
categoryStatusOptions: Ref<TaskStatusOptions|undefined>;
targetStatusType: Ref<TaskStatusType | undefined>;
}) => {
    const defaultStatusOption = computed<TaskStatusOption|undefined>(() => {
        if (!targetStatusType.value) return undefined;
        if (!categoryStatusOptions.value) return undefined;
        const defaultStatusOp = categoryStatusOptions.value[targetStatusType.value].find((op) => op.is_default);
        if (!defaultStatusOp) return undefined;
        return defaultStatusOp;
    });

    return { defaultStatusOption };
};
