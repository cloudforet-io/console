import type { FeatureVersionSettingsType } from '@/lib/config/global-config/types/type';
import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import adminOpsFlowRoutes from '@/services/ops-flow/routes/admin/routes';
import opsFlowRoutes from '@/services/ops-flow/routes/routes';

class OpsFlowConfigurator {
    static getAdminRoutes() {
        return adminOpsFlowRoutes;
    }

    static getWorkspaceRoutes() {
        return opsFlowRoutes;
    }

    static getAdminMenu(settings: FeatureVersionSettingsType): Menu {
        const menu = settings.adminMenu || settings.menu;
        const subMenuIds = Object.keys(menu).filter((menuId) => (menu)[menuId])
            .map((menuId) => ({ id: MENU_INFO_MAP[menuId].menuId }));
        return {
            id: MENU_ID.OPS_FLOW,
            subMenuList: subMenuIds,
        };
    }

    static getWorkspaceMenu(settings: FeatureVersionSettingsType): Menu {
        const menu = settings.menu;
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

    static applyUiAffects(): void|null {
        return null;
    }
}

export default OpsFlowConfigurator;
