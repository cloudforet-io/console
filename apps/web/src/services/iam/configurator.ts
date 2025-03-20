import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import adminIamRoutes from '@/services/iam/routes/admin/routes';
import iamRoutes from '@/services/iam/routes/routes';

class IamConfigurator {
    static getAdminRoutes() {
        return adminIamRoutes;
    }

    static getWorkspaceRoutes() {
        return iamRoutes;
    }

    static getAdminMenu(version: string): Menu {
        return {
            id: MENU_ID.IAM,
            subMenuList: version === 'V1' ? [
                { id: MENU_ID.USER },
                { id: MENU_ID.APP },
                { id: MENU_ID.ROLE },
            ] : [
                { id: MENU_ID.USER },
                { id: MENU_ID.USER_GROUP },
                { id: MENU_ID.APP },
                { id: MENU_ID.ROLE },
            ],
        };
    }

    static getWorkspaceMenu(version: string): Menu {
        return {
            id: MENU_ID.IAM,
            needPermissionByRole: true,
            subMenuList: version === 'V1' ? [
                { id: MENU_ID.USER, needPermissionByRole: true },
                { id: MENU_ID.APP, needPermissionByRole: true },
            ] : [
                { id: MENU_ID.USER, needPermissionByRole: true },
                { id: MENU_ID.USER_GROUP, needPermissionByRole: true },
                { id: MENU_ID.APP, needPermissionByRole: true },
            ],
        };
    }
}

export default IamConfigurator;
