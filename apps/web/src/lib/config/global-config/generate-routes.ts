import type { RouteConfig } from 'vue-router';

import { getFeatureConfigurator } from '@/lib/config/global-config/helpers/get-feature-configurator';
import type { FeatureSchemaType } from '@/lib/config/global-config/types/type';

import adminAdvancedRoutes from '@/services/advanced/routes/admin/routes';
import adminInfoRoutes from '@/services/info/routes/admin/routes';
import infoRoutes from '@/services/info/routes/routes';
import adminWorkspaceHomeRoutes from '@/services/workspace-home/routes/admin/routes';
import workspaceHomeRoute from '@/services/workspace-home/routes/routes';

export const generateRoutes = (featureSchema: FeatureSchemaType, mode: string): RouteConfig[] => {
    const baseRoutes = mode === 'admin'
        ? [adminWorkspaceHomeRoutes, adminAdvancedRoutes, adminInfoRoutes]
        : [workspaceHomeRoute, infoRoutes];

    Object.keys(featureSchema).forEach((serviceName) => {
        const configurator = getFeatureConfigurator(serviceName);
        if (configurator) {
            const version = featureSchema[serviceName].currentVersion;
            const route = mode === 'admin'
                ? configurator.getAdminRoutes(version)
                : configurator.getWorkspaceRoutes(version);
            if (route && !baseRoutes.some((existingRoute) => existingRoute.path === route.path)) {
                baseRoutes.push(route);
            }
        }
    });

    return baseRoutes;
};
