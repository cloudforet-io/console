
import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import type { FeatureVersions } from '@/services/configurator';
import adminIamRoutes, { ADMIN_USER_GROUP_ROUTE } from '@/services/iam/routes/admin/routes';
import iamRoutes, { USER_GROUP_ROUTE } from '@/services/iam/routes/routes';

class IamConfigurator {
    static getAdminRoutes(featureVersions: FeatureVersions) {
        const adminRoutes = adminIamRoutes;
        if (featureVersions.ALERT_MANAGER === 'V2') {
            adminRoutes.children?.push(ADMIN_USER_GROUP_ROUTE);
        }
        return adminRoutes;
    }

    static getWorkspaceRoutes(featureVersions: FeatureVersions) {
        const routes = iamRoutes;
        if (featureVersions.ALERT_MANAGER === 'V2') {
            routes.children?.push(USER_GROUP_ROUTE);
        }
        return routes;
    }

    static getAdminMenu(featureVersions: FeatureVersions): Menu {
        return {
            id: MENU_ID.IAM,
            subMenuList: featureVersions.ALERT_MANAGER === 'V1' ? [
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

    static getWorkspaceMenu(featureVersions: FeatureVersions): Menu {
        return {
            id: MENU_ID.IAM,
            needPermissionByRole: true,
            subMenuList: featureVersions.ALERT_MANAGER === 'V1' ? [
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
