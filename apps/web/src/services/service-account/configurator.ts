import { MENU_ID } from '@/lib/menu/config';

import adminServiceAccountRoute from '@/services/service-account/routes/admin/routes';
import serviceAccountRoute from '@/services/service-account/routes/routes';

class ServiceAccountConfigurator {
    static getAdminRoutes() {
        return adminServiceAccountRoute;
    }

    static getWorkspaceRoutes() {
        return serviceAccountRoute;
    }

    static getAdminMenu() {
        return { id: MENU_ID.SERVICE_ACCOUNT };
    }

    static getWorkspaceMenu() {
        return { id: MENU_ID.SERVICE_ACCOUNT, needPermissionByRole: true };
    }
}

export default ServiceAccountConfigurator;
