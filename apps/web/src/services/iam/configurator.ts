import adminIamRoutes from '@/services/iam/routes/admin/routes';
import iamRoutes from '@/services/iam/routes/routes';

class IamConfigurator {
    static getAdminRoutes() {
        return adminIamRoutes;
    }

    static getWorkspaceRoutes() {
        return iamRoutes;
    }
}

export default IamConfigurator;
