import type { Menu } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import type { versionSchemaType } from '@/services/featureSchema';
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

    static getWorkspaceMenu(versionSchema: versionSchemaType): Menu {
        const menuId = Object.keys(versionSchema.menu)[0];
        return { id: MENU_INFO_MAP[menuId].menuId, needPermissionByRole: true };
    }
}

export default ProjectConfigurator;
