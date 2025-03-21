import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import type { schemaType } from '@/services/featureSchema';
import projectRoutesV1 from '@/services/project/v1/routes/routes';
import projectRoutes from '@/services/project/v2/routes/routes';

class ProjectConfigurator {
    static getAdminRoutes() {
        return null;
    }

    static getWorkspaceRoutes(featureSchema: schemaType) {
        return featureSchema.version === 'V1' ? projectRoutesV1 : projectRoutes;
    }

    static getAdminMenu(): Menu|null {
        return null;
    }

    static getWorkspaceMenu(): Menu {
        return { id: MENU_ID.PROJECT, needPermissionByRole: true };
    }
}

export default ProjectConfigurator;
