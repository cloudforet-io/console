import { useGlobalConfigStore } from '@/store/global-config/global-config-store';

import { getFeatureConfigurator } from '@/lib/config/global-config/helpers/get-feature-configurator';
import type { GeneratedFeatureRouteConfig } from '@/lib/config/global-config/types/type';

import adminAdvancedRoutes from '@/services/advanced/routes/admin/routes';
import adminInfoRoutes from '@/services/info/routes/admin/routes';
import infoRoutes from '@/services/info/routes/routes';
import adminWorkspaceHomeRoutes from '@/services/workspace-home/routes/admin/routes';
import workspaceHomeRoute from '@/services/workspace-home/routes/routes';

export const generateRoutes = (): GeneratedFeatureRouteConfig => {
    const globalConfigStore = useGlobalConfigStore();
    const schema = globalConfigStore.state.menuSchema;
    const baseRoutes: GeneratedFeatureRouteConfig = {
        routes: [workspaceHomeRoute, infoRoutes],
        adminRoutes: [adminWorkspaceHomeRoutes, adminAdvancedRoutes, adminInfoRoutes],
    };

    Object.keys(schema).forEach((serviceName) => {
        const configurator = getFeatureConfigurator(serviceName);
        if (configurator) {
            const featureRoutes = configurator.getRoutes();
            if (featureRoutes?.routes) {
                baseRoutes.routes.push(featureRoutes.routes);
            }
            if (featureRoutes?.adminRoutes) {
                baseRoutes.adminRoutes.push(featureRoutes.adminRoutes);
            }
        }
    });

    return baseRoutes;
};
