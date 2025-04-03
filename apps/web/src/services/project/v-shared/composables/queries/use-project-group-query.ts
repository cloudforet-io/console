import { computed, type Ref } from 'vue';

import { useQuery, useQueryClient } from '@tanstack/vue-query';

import { useProjectGroupApi } from '@/api-clients/identity/project-group/composables/use-project-group-api';
import type { ProjectGroupModel } from '@/api-clients/identity/project-group/schema/model';

export const useProjectGroupQuery = ({
    projectGroupId,
    enabled,
}: {
  projectGroupId: Ref<string|undefined>;
  enabled?: Ref<boolean>;
}) => {
    const { projectGroupAPI, projectGroupQueryKey } = useProjectGroupApi();
    const queryKey = computed(() => [...projectGroupQueryKey.value, projectGroupId.value]);
    const projectGroupQuery = useQuery({
        queryKey,
        queryFn: () => projectGroupAPI.get({ project_group_id: projectGroupId.value as string }),
        enabled: computed(() => {
            if (!projectGroupId.value) return false;
            return enabled ? enabled.value : true;
        }),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    });

    const queryClient = useQueryClient();
    const setQueryData = (newData: ProjectGroupModel) => {
        queryClient.setQueryData(queryKey.value, newData);
    };
    const invalidateQuery = () => {
        queryClient.invalidateQueries({ queryKey: queryKey.value });
    };

    return {
        ...projectGroupQuery,
        setQueryData,
        invalidateQuery,
    };
};
