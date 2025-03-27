import type { FeatureVersionSettingsType } from '@/lib/config/global-config/type';
import type { Menu } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import adminServiceAccountRoute from '@/services/service-account/routes/admin/routes';
import serviceAccountRoute from '@/services/service-account/routes/routes';

class ServiceAccountConfigurator {
    static getAdminRoutes() {
        return adminServiceAccountRoute;
    }

    static getWorkspaceRoutes() {
        return serviceAccountRoute;
    }

    static getAdminMenu(settings: FeatureVersionSettingsType): Menu {
        const menuId = Object.keys(settings.adminMenu || settings.menu)[0];
        return { id: MENU_INFO_MAP[menuId].menuId };
    }

    static getWorkspaceMenu(settings: FeatureVersionSettingsType): Menu {
        const menuId = Object.keys(settings.menu)[0];
        return { id: MENU_INFO_MAP[menuId].menuId, needPermissionByRole: true };
    }

    static applyUiAffects(): void|null {
        return null;
    }
}

export default ServiceAccountConfigurator;
