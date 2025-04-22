import { useGlobalConfigSchemaStore } from '@/store/global-config-schema/global-config-schema-store';
import { pinia } from '@/store/pinia';


import type {
    GeneratedMenuSchema,
    GeneratedRouteSchema,
    GeneratedRouteMetadataSchema,
    GeneratedUiAffectSchema,
} from '@/lib/config/global-config/types/type';

type DynamicMenuHandler = (menuSchema: GeneratedMenuSchema) => Promise<GeneratedMenuSchema>;

export class DynamicSchemaManager {
    private static instance: DynamicSchemaManager;

    private globalConfigSchemaStore = useGlobalConfigSchemaStore(pinia);

    private dynamicMenuHandlers: Map<string, DynamicMenuHandler> = new Map();

    // private constructor() {
    //     this.initializeHandlers();
    // }

    static getInstance(): DynamicSchemaManager {
        if (!DynamicSchemaManager.instance) {
            DynamicSchemaManager.instance = new DynamicSchemaManager();
        }
        return DynamicSchemaManager.instance;
    }

    // private initializeHandlers() {}

    registerDynamicMenuHandler(serviceName: string, handler: DynamicMenuHandler) {
        this.dynamicMenuHandlers.set(serviceName, handler);
    }

    private async updateMenuSchema(menuSchema: GeneratedMenuSchema) {
        const updatedMenuSchema = await this.applyDynamicMenu(menuSchema);
        this.globalConfigSchemaStore.setMenuSchema(updatedMenuSchema);
    }

    private async applyDynamicMenu(menuSchema: GeneratedMenuSchema): Promise<GeneratedMenuSchema> {
        return Array.from(this.dynamicMenuHandlers.values()).reduce(
            async (acc, handler) => handler(await acc),
            Promise.resolve(menuSchema),
        );
    }

    async updateSchema(
        menuSchema: GeneratedMenuSchema,
        routeSchema: GeneratedRouteSchema,
        routeMetadataSchema: GeneratedRouteMetadataSchema,
        uiAffectSchema: GeneratedUiAffectSchema,
    ) {
        const dynamicMenuSchema = await this.applyDynamicMenu(menuSchema);

        this.globalConfigSchemaStore.setMenuSchema(dynamicMenuSchema);
        this.globalConfigSchemaStore.setRouteSchema(routeSchema);
        this.globalConfigSchemaStore.setRouteMetadataSchema(routeMetadataSchema);
        this.globalConfigSchemaStore.setUiAffectsSchema(uiAffectSchema);
    }
}

export default DynamicSchemaManager.getInstance();
