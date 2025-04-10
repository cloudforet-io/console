import type { RouteConfig } from 'vue-router';

import { useGlobalConfigStore } from '@/store/global-config/global-config-store';

import { getFeatureConfigurator } from '@/lib/config/global-config/helpers/get-feature-configurator';

import adminAdvancedRoutes from '@/services/advanced/routes/admin/routes';
import adminInfoRoutes from '@/services/info/routes/admin/routes';
import infoRoutes from '@/services/info/routes/routes';
import adminWorkspaceHomeRoutes from '@/services/workspace-home/routes/admin/routes';
import workspaceHomeRoute from '@/services/workspace-home/routes/routes';

export const generateRoutes = (mode: string): RouteConfig[] => {
    const globalConfigStore = useGlobalConfigStore();
    const schema = globalConfigStore.state.schema;
    const baseRoutes = mode === 'admin'
        ? [adminWorkspaceHomeRoutes, adminAdvancedRoutes, adminInfoRoutes]
        : [workspaceHomeRoute, infoRoutes];

    Object.keys(schema).forEach((serviceName) => {
        const configurator = getFeatureConfigurator(serviceName);
        if (configurator) {
            const route = configurator.getRoutes(mode === 'admin');
            if (route && !baseRoutes.some((existingRoute) => existingRoute.path === route.path)) {
                baseRoutes.push(route);
            }
        }
    });

    return baseRoutes;
};
