import adminCostExplorerRoutes from '@/services/cost-explorer/routes/admin/routes';
import costExplorerRoutes from '@/services/cost-explorer/routes/routes';

class CostExplorerConfigurator {
    static getAdminRoutes() {
        return adminCostExplorerRoutes;
    }

    static getWorkspaceRoutes() {
        return costExplorerRoutes;
    }
}

export default CostExplorerConfigurator;
