import { computed, type ComputedRef } from 'vue';

import type { ProjectPageContextType } from '@/services/project/v2/types/project-page-context-type';

export const useProjectPageContext = (options: {
    projectGroupId?: ComputedRef<string|undefined>,
    projectId?: ComputedRef<string|undefined>,
}) => computed<ProjectPageContextType>(() => {
    if (options.projectGroupId?.value) {
        return 'PROJECT_GROUP';
    }
    if (options.projectId?.value) {
        return 'PROJECT';
    }
    return undefined;
});
