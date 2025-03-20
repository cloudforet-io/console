import adminAssetInventoryRoutes from '@/services/asset-inventory/routes/admin/routes';
import assetInventoryRoute from '@/services/asset-inventory/routes/routes';

class AssetInventoryConfigurator {
    static getAdminRoutes() {
        return adminAssetInventoryRoutes;
    }

    static getWorkspaceRoutes() {
        return assetInventoryRoute;
    }
}

export default AssetInventoryConfigurator;
