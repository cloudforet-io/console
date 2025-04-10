// composables/useDashboardRouteContext.ts
import { computed } from 'vue';
import { useRoute } from 'vue-router/composables';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { MENU_ID } from '@/lib/menu/config';

type EntryPoint = 'ADMIN' | 'WORKSPACE' | 'PROJECT' | 'UNKNOWN';
type ProjectContextType = 'PROJECT' | 'PROJECT_GROUP' | undefined;

/**
 * Provides contextual information about the current dashboard route.
 *
 * - `entryPoint` tells where this dashboard page is accessed from.
 * - If `entryPoint === 'PROJECT'`, then `projectGroupOrProjectId` and `projectContextType` will be available.
 *   (Business logic guarantees this, though they are optional in the type system.)
 * - Use `entryPoint === 'PROJECT'` check before using project-specific fields.
 */
export const useDashboardRouteContext = () => {
    const route = useRoute();
    const appContextStore = useAppContextStore();

    const isAdminMode = computed(() => appContextStore.getters.isAdminMode);

    const entryPoint = computed<EntryPoint>(() => {
        // Global admin mode overrides route-level checks
        if (isAdminMode.value) return 'ADMIN';

        // Project dashboard route (nested under project-level menu)
        if (route.matched.some((m) => m.meta.menuId === MENU_ID.PROJECT)) return 'PROJECT';
        if (route.matched.some((m) => m.meta.menuId === MENU_ID.DASHBOARDS)) return 'WORKSPACE';
        return 'UNKNOWN';
    });

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
