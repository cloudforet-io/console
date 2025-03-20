import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import adminOpsFlowRoutes from '@/services/ops-flow/routes/admin/routes';
import opsFlowRoutes from '@/services/ops-flow/routes/routes';

class OpsFlowConfigurator {
    static getAdminRoutes() {
        return adminOpsFlowRoutes;
    }

    static getWorkspaceRoutes() {
        return opsFlowRoutes;
    }

    static getAdminMenu(): Menu {
        return {
            id: MENU_ID.OPS_FLOW,
            subMenuList: [
                { id: MENU_ID.TASK_MANAGEMENT },
            ],
        };
    }

    static getWorkspaceMenu(): Menu {
        return {
            id: MENU_ID.OPS_FLOW,
            needPermissionByRole: true,
            subMenuList: [
                { id: MENU_ID.OPS_FLOW_LANDING },
                { id: MENU_ID.TASK_BOARD },
            ],
        };
    }
}

export default OpsFlowConfigurator;
