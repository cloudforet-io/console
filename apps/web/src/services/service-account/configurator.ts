import type { Menu } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import type { versionSchemaType } from '@/services/featureSchema';
import adminServiceAccountRoute from '@/services/service-account/routes/admin/routes';
import serviceAccountRoute from '@/services/service-account/routes/routes';

class ServiceAccountConfigurator {
    static getAdminRoutes() {
        return adminServiceAccountRoute;
    }

    static getWorkspaceRoutes() {
        return serviceAccountRoute;
    }

    static getAdminMenu(versionSchema: versionSchemaType): Menu {
        const menuId = Object.keys(versionSchema.adminMenu || versionSchema.menu)[0];
        return { id: MENU_INFO_MAP[menuId].menuId };
    }

    static getWorkspaceMenu(versionSchema: versionSchemaType): Menu {
        const menuId = Object.keys(versionSchema.menu)[0];
        return { id: MENU_INFO_MAP[menuId].menuId, needPermissionByRole: true };
    }
}

export default ServiceAccountConfigurator;
