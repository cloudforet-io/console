import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import type { versionSchemaType } from '@/services/featureSchema';
import adminOpsFlowRoutes from '@/services/ops-flow/routes/admin/routes';
import opsFlowRoutes from '@/services/ops-flow/routes/routes';

class OpsFlowConfigurator {
    static getAdminRoutes() {
        return adminOpsFlowRoutes;
    }

    static getWorkspaceRoutes() {
        return opsFlowRoutes;
    }

    static getAdminMenu(versionSchema: versionSchemaType): Menu {
        const menu = versionSchema.adminMenu || versionSchema.menu;
        const subMenuIds = Object.keys(menu).filter((menuId) => (menu)[menuId])
            .map((menuId) => ({ id: MENU_INFO_MAP[menuId].menuId }));
        return {
            id: MENU_ID.OPS_FLOW,
            subMenuList: subMenuIds,
        };
    }

    static getWorkspaceMenu(versionSchema: versionSchemaType): Menu {
        const menu = versionSchema.menu;
        const subMenuIds = Object.keys(menu).filter((menuId) => (menu)[menuId])
            .map((menuId) => ({
                id: MENU_INFO_MAP[menuId].menuId,
                needPermissionByRole: true,
            }));
        return {
            id: MENU_ID.OPS_FLOW,
            needPermissionByRole: true,
            subMenuList: subMenuIds,
        };
    }
}

export default OpsFlowConfigurator;
