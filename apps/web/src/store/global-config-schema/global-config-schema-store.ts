import { reactive } from 'vue';

import { defineStore } from 'pinia';


import type {
    GeneratedRouteSchema,
    GeneratedMenuSchema, GeneratedRouteMetadataSchema, GeneratedUiAffectSchema,
} from '@/lib/config/global-config/types/type';

interface GlobalConfigSchemaStoreState {
    uiAffectsSchema: GeneratedUiAffectSchema;
    menuSchema: GeneratedMenuSchema;
    routeMetadataSchema: GeneratedRouteMetadataSchema;
    routeSchema: GeneratedRouteSchema;
}

export const useGlobalConfigSchemaStore = defineStore('global-config-schema-store', () => {
    const state = reactive<GlobalConfigSchemaStoreState>({
        uiAffectsSchema: {} as GeneratedUiAffectSchema,
        menuSchema: {} as GeneratedMenuSchema,
        routeMetadataSchema: {} as GeneratedRouteMetadataSchema,
        routeSchema: {} as GeneratedRouteSchema,
    });

    const actions = {
        setMenuSchema(menuSchema: GeneratedMenuSchema) {
            state.menuSchema = menuSchema;
        },
        setUiAffectsSchema(uiAffectsSchema: GeneratedUiAffectSchema) {
            state.uiAffectsSchema = uiAffectsSchema;
        },
        setRouteMetadataSchema(routeMetadataSchema: GeneratedRouteMetadataSchema) {
            state.routeMetadataSchema = routeMetadataSchema;
        },
        setRouteSchema(routeSchema: GeneratedRouteSchema) {
            state.routeSchema = routeSchema;
        },
    };

    return {
        state,
        ...actions,
    };
});
