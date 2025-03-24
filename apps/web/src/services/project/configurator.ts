import type { FeatureVersionSettingsType } from '@/lib/config/global-config/type';
import type { Menu } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import projectRoutesV1 from '@/services/project/v1/routes/routes';
import projectRoutes from '@/services/project/v2/routes/routes';

class ProjectConfigurator {
    static getAdminRoutes() {
        return null;
    }

    static getWorkspaceRoutes(version: string) {
        return version === 'V1' ? projectRoutesV1 : projectRoutes;
    }

    static getAdminMenu(): Menu|null {
        return null;
    }

    static getWorkspaceMenu(settings: FeatureVersionSettingsType): Menu {
        const menuId = Object.keys(settings.menu)[0];
        return { id: MENU_INFO_MAP[menuId].menuId, needPermissionByRole: true };
    }
}

export default ProjectConfigurator;
