import { computed, type Ref } from 'vue';

import { useQuery } from '@tanstack/vue-query';

import { useProjectGroupApi } from '@/api-clients/identity/project-group/composables/use-project-group-api';

export const useProjectGroupQuery = ({
    projectGroupId,
    enabled,
}: {
  projectGroupId: Ref<string|undefined>;
  enabled?: Ref<boolean>;
}) => {
    const { projectGroupAPI, projectGroupQueryKey } = useProjectGroupApi();
    const { data, isLoading, error } = useQuery({
        queryKey: computed(() => [...projectGroupQueryKey.value, projectGroupId.value]),
        queryFn: () => projectGroupAPI.get({ project_group_id: projectGroupId.value as string }),
        enabled: computed(() => {
            if (!projectGroupId.value) return false;
            return enabled ? enabled.value : true;
        }),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    });

    return {
        data, isLoading, error,
    };
};
