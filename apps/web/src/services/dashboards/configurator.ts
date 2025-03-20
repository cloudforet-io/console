import adminDashboardsRoute from '@/services/dashboards/routes/admin/routes';
import dashboardsRoute from '@/services/dashboards/routes/routes';

class DashboardConfigurator {
    static getAdminRoutes() {
        return adminDashboardsRoute;
    }

    static getWorkspaceRoutes() {
        return dashboardsRoute;
    }
}

export default DashboardConfigurator;
