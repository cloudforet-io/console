import { computed } from 'vue';
import { useRoute } from 'vue-router/composables';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { useDashboardEntryPoint } from '@/services/_shared/dashboard/core/composables/_internal/dashboard-shared-entry-context';

type ProjectContextType = 'PROJECT' | 'PROJECT_GROUP' | undefined;

/**
 * Provides contextual information about the current dashboard route.
 *
 * - `entryPoint` tells where this dashboard page is accessed from.
 * - If `entryPoint === 'PROJECT'`, then `projectGroupOrProjectId` and `projectContextType` will be available.
 *   (Business logic guarantees this, though they are optional in the type system.)
 * - Use `entryPoint === 'PROJECT'` check before using project-specific fields.
 */
export const useDashboardSharedContext = () => {
    const route = useRoute();
    const appContextStore = useAppContextStore();

    const isAdminMode = computed(() => appContextStore.getters.isAdminMode);
    const entryPoint = useDashboardEntryPoint();

    /* Project Context */
    const projectGroupOrProjectId = computed(() => {
        if (entryPoint.value !== 'PROJECT') return undefined;
        const id = route.params.projectGroupOrProjectId;
        return typeof id === 'string' ? id : undefined;
    });

    const projectContextType = computed<ProjectContextType>(() => {
        const id = route.params.projectGroupOrProjectId;
        if (!id) return undefined;
        if (id.startsWith('pg-')) return 'PROJECT_GROUP';
        if (id.startsWith('project-')) return 'PROJECT';
        return undefined;
    });

    return {
        entryPoint,
        isAdminMode,
        projectGroupOrProjectId,
        projectContextType,
    };
};
