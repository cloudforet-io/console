import alertManagerRouteV1 from '@/services/alert-manager/v1/routes/routes';
import alertManagerRoute from '@/services/alert-manager/v2/routes/routes';

class AlertManagerConfigurator {
    static getAdminRoutes() {
        return null;
    }

    static getWorkspaceRoutes(version: string) {
        return version === 'V1' ? alertManagerRouteV1 : alertManagerRoute;
    }
}

export default AlertManagerConfigurator;
