import adminOpsFlowRoutes from '@/services/ops-flow/routes/admin/routes';
import opsFlowRoutes from '@/services/ops-flow/routes/routes';

class OpsFlowConfigurator {
    static getAdminRoutes() {
        return adminOpsFlowRoutes;
    }

    static getWorkspaceRoutes() {
        return opsFlowRoutes;
    }
}

export default OpsFlowConfigurator;
