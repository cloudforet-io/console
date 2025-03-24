import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import type { versionSchemaType } from '@/services/featureSchema';
import adminIamRoutes, { ADMIN_USER_GROUP_ROUTE } from '@/services/iam/routes/admin/routes';
import iamRoutes, { USER_GROUP_ROUTE } from '@/services/iam/routes/routes';

class IamConfigurator {
    static getAdminRoutes(version: string) {
        const adminRoutes = adminIamRoutes;
        if (version === 'V1') {
            adminRoutes.children?.push(ADMIN_USER_GROUP_ROUTE);
        }
        return adminRoutes;
    }

    static getWorkspaceRoutes(version: string) {
        const routes = iamRoutes;
        if (version === 'V1') {
            routes.children?.push(USER_GROUP_ROUTE);
        }
        return routes;
    }

    static getAdminMenu(versionSchema: versionSchemaType): Menu {
        const menu = versionSchema.adminMenu || versionSchema.menu;
        const subMenuIds = Object.keys(menu).filter((menuId) => (menu)[menuId])
            .map((menuId) => ({ id: MENU_INFO_MAP[menuId].menuId }));
        return {
            id: MENU_ID.IAM,
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
            id: MENU_ID.IAM,
            needPermissionByRole: true,
            subMenuList: subMenuIds,
        };
    }
}

export default IamConfigurator;
