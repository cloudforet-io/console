import type { Ref } from 'vue';
import { computed } from 'vue';

import { useProjectGroupsQuery } from '@/services/project/v-shared/composables/queries/use-project-groups-query';

export const useProjectGroupNames = ({
    projectGroupId, enabled,
}: {
  projectGroupId?: Ref<string|undefined>;
  enabled: Ref<boolean>;
}) => {
    const { data } = useProjectGroupsQuery({ enabled });

    const projectGroupNames = computed<string[]>(() => {
        if (!data.value) return [];
        if (projectGroupId?.value) {
            return data.value.filter((pg) => pg.project_group_id !== projectGroupId.value).map((item) => item.name);
        }
        return data.value.map((item) => item.name);
    });

    return projectGroupNames;
};
