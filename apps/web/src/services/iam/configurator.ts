import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import type { schemaType } from '@/services/featureSchema';
import adminIamRoutes, { ADMIN_USER_GROUP_ROUTE } from '@/services/iam/routes/admin/routes';
import iamRoutes, { USER_GROUP_ROUTE } from '@/services/iam/routes/routes';

class IamConfigurator {
    static getAdminRoutes(featureSchema: schemaType) {
        const adminRoutes = adminIamRoutes;
        if (featureSchema.version === 'V1') {
            adminRoutes.children?.push(ADMIN_USER_GROUP_ROUTE);
        }
        return adminRoutes;
    }

    static getWorkspaceRoutes(featureSchema: schemaType) {
        const routes = iamRoutes;
        if (featureSchema.version === 'V1') {
            routes.children?.push(USER_GROUP_ROUTE);
        }
        return routes;
    }

    static getAdminMenu(featureSchema: schemaType): Menu {
        return {
            id: MENU_ID.IAM,
            subMenuList: featureSchema.version === 'V1' ? [
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

    static getWorkspaceMenu(featureSchema: schemaType): Menu {
        return {
            id: MENU_ID.IAM,
            needPermissionByRole: true,
            subMenuList: featureSchema.version === 'V1' ? [
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
