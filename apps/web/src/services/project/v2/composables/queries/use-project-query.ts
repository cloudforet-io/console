import type { Ref } from 'vue';
import { computed, isRef } from 'vue';

import { useQuery, useQueryClient } from '@tanstack/vue-query';

import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';

export const useProjectQuery = ({
    projectId,
    enabled,
}: {
  projectId: Ref<string|undefined>;
enabled?: Ref<boolean>|boolean;
}) => {
    const { projectAPI, projectQueryKey } = useProjectApi();
    const projectQuery = useQuery({
        queryKey: computed(() => [...projectQueryKey.value, projectId.value]),
        queryFn: () => projectAPI.get({ project_id: projectId.value as string }),
        enabled: computed(() => {
            if (!projectId.value) return false;
            if (enabled === undefined) return true;
            return isRef(enabled) ? enabled.value : enabled;
        }),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    });

    const queryClient = useQueryClient();
    const invalidateQuery = () => {
        if (projectId.value) {
            queryClient.invalidateQueries({ queryKey: [...projectQueryKey.value, projectId.value] });
        }
    };
    const setQueryData = (newData: any) => {
        queryClient.setQueryData([...projectQueryKey.value, projectId.value], newData);
    };

    return {
        ...projectQuery, invalidateQuery, setQueryData,
    };
};
