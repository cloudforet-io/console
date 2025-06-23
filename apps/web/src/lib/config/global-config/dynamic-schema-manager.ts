import type { PublicConfigModel } from '@/api-clients/config/public-config/schema/model';

import { usePublicConfigStore } from '@/store/config/public-config-store';
import { useGlobalConfigSchemaStore } from '@/store/global-config-schema/global-config-schema-store';
import { pinia } from '@/store/pinia';

import type {
    GeneratedMenuSchema,
    GeneratedRouteSchema,
    GeneratedRouteMetadataSchema,
    GeneratedUiAffectSchema,
} from '@/lib/config/global-config/types/type';
import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

type DynamicMenuHandler = (menuSchema: GeneratedMenuSchema) => Promise<GeneratedMenuSchema>;

interface ExtraMenu {
    anomaly_detection: {
        enabled: boolean;
    };
}

export class DynamicSchemaManager {
    private globalConfigSchemaStore = useGlobalConfigSchemaStore(pinia);

    private publicConfigStore = usePublicConfigStore(pinia);

    private dynamicMenuHandlers: Map<string, DynamicMenuHandler> = new Map();

    private extraMenu: PublicConfigModel<ExtraMenu> | null = null;

    async initialize() {
        try {
            this.extraMenu = await this.publicConfigStore.get<ExtraMenu>('EXTRA_MENU');

            const isAnomalyDetectionEnabled = this.extraMenu?.data?.anomaly_detection?.enabled ?? false;

            if (isAnomalyDetectionEnabled) {
                this.registerDynamicMenuHandler('COST_EXPLORER', async (menu) => DynamicSchemaManager.appendSubMenuToServiceMenu(menu, 'COST_ANALYSIS', { id: MENU_ID.ANOMALY_DETECTION }, 1));
            }
        } catch (error) {}
    }

    async applySchema(
        menuSchema: GeneratedMenuSchema,
        routeSchema: GeneratedRouteSchema,
        routeMetadataSchema: GeneratedRouteMetadataSchema,
        uiAffectSchema: GeneratedUiAffectSchema,
    ) {
        const dynamicMenuSchema = await this.getDynamicMenuHandlers(menuSchema);

        this.globalConfigSchemaStore.setMenuSchema(dynamicMenuSchema);
        this.globalConfigSchemaStore.setRouteSchema(routeSchema);
        this.globalConfigSchemaStore.setRouteMetadataSchema(routeMetadataSchema);
        this.globalConfigSchemaStore.setUiAffectsSchema(uiAffectSchema);
    }

    private async getDynamicMenuHandlers(menuSchema: GeneratedMenuSchema): Promise<GeneratedMenuSchema> {
        const handlers = Array.from(this.dynamicMenuHandlers.values());
        return handlers.reduce(
            async (acc, handler) => handler(await acc),
            Promise.resolve(menuSchema),
        );
    }

    registerDynamicMenuHandler(serviceName: string, handler: DynamicMenuHandler) {
        this.dynamicMenuHandlers.set(serviceName, handler);
    }

    private static appendSubMenuToServiceMenu(
        schema: GeneratedMenuSchema,
        serviceKey: string,
        subMenuItem: Menu,
        position?: number,
    ): GeneratedMenuSchema {
        const targetAdminMenu = schema?.[serviceKey]?.adminMenu;
        if (!targetAdminMenu?.subMenuList) return schema;

        const exists = targetAdminMenu.subMenuList.some((item) => item.id === subMenuItem.id);
        if (exists) return schema;

        const newSubMenuList = [...targetAdminMenu.subMenuList];

        if (typeof position === 'number' && position >= 0 && position <= newSubMenuList.length) {
            newSubMenuList.splice(position, 0, subMenuItem);
        } else {
            newSubMenuList.push(subMenuItem);
        }

        return {
            ...schema,
            [serviceKey]: {
                ...schema[serviceKey],
                adminMenu: {
                    ...targetAdminMenu,
                    subMenuList: newSubMenuList,
                },
            },
        };
    }

    private async updateMenuSchema(menuSchema: GeneratedMenuSchema) {
        const updatedMenuSchema = await this.getDynamicMenuHandlers(menuSchema);
        this.globalConfigSchemaStore.setMenuSchema(updatedMenuSchema);
    }
}

export default new DynamicSchemaManager();
