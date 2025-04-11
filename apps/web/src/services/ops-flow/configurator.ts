import type { RouteConfig } from 'vue-router';

import type { FeatureConfiguratorType, FeatureMenuConfig, FeatureUiAffect } from '@/lib/config/global-config/types/type';
import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import adminOpsFlowRoutes from '@/services/ops-flow/routes/admin/routes';
import opsFlowRoutes from '@/services/ops-flow/routes/routes';

class OpsFlowConfigurator implements FeatureConfiguratorType {
    private version: 'V1' | 'V2' = 'V1';

    readonly uiAffect: FeatureUiAffect[] = [];

    initialize(version: 'V1' | 'V2'): void {
        this.version = version;
    }

    // eslint-disable-next-line class-methods-use-this
    getRoutes(isAdmin?: boolean): RouteConfig {
        return isAdmin ? adminOpsFlowRoutes : opsFlowRoutes;
    }

    getMenu(): FeatureMenuConfig {
        const baseMenu: Menu = {
            id: MENU_ID.OPS_FLOW,
            needPermissionByRole: true,
            subMenuList: [],
            order: 7,
        };

        return {
            menu: {
                ...baseMenu,
                subMenuList: [
                    { id: MENU_ID.OPS_FLOW_LANDING, needPermissionByRole: true },
                    { id: MENU_ID.TASK_BOARD, needPermissionByRole: true },
                ],
            },
            adminMenu: {
                ...baseMenu,
                subMenuList: [
                    { id: MENU_ID.TASK_MANAGEMENT },
                ],
            },
            version: this.version,
        };
    }
}

export default new OpsFlowConfigurator();
