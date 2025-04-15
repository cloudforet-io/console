import { computed, reactive } from 'vue';

import { orderBy } from 'lodash';
import { defineStore } from 'pinia';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import type {
    GeneratedMenuSchema, GeneratedRouteMetadataSchema, GeneratedUiAffectSchema,
} from '@/lib/config/global-config/types/type';
import type { Menu, MenuId } from '@/lib/menu/config';
import { DEFAULT_MENU_LIST, DEFAULT_ADMIN_MENU_LIST } from '@/lib/menu/menu-architecture';

interface GlobalConfigStoreState {
    uiAffectsSchema: GeneratedUiAffectSchema;
    menuSchema: GeneratedMenuSchema;
    routeMetadataSchema: GeneratedRouteMetadataSchema;
}
export type FlattenedMenuMap = Partial<Record<MenuId, MenuId[]>>;

export const useGlobalConfigStore = defineStore('global-config-store', () => {
    const appContextStore = useAppContextStore();

    const state = reactive<GlobalConfigStoreState>({
        uiAffectsSchema: {} as GeneratedUiAffectSchema,
        menuSchema: {} as GeneratedMenuSchema,
        routeMetadataSchema: {} as GeneratedRouteMetadataSchema,
    });

    const _getters = reactive({
        isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
    });

    const getters = reactive({
        menuList: computed<Menu[]>(() => {
            const menuList: Menu[] = _getters.isAdminMode ? [] : DEFAULT_MENU_LIST;

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            Object.entries(state.menuSchema).forEach(([_, featureSetting]) => {
                if (featureSetting) {
                    const menu = _getters.isAdminMode ? featureSetting.adminMenu : featureSetting.menu;
                    if (menu && !menuList.some((existingMenu) => existingMenu.id === menu.id)) {
                        menuList.push(menu);
                    }
                }
            });

            if (_getters.isAdminMode) {
                menuList.push(...DEFAULT_ADMIN_MENU_LIST);
            }

            const orderedMenus = menuList.filter((menu) => menu.order !== undefined);
            const unorderedMenus = menuList.filter((menu) => menu.order === undefined);

            return [...orderBy(orderedMenus, ['order'], ['asc']), ...unorderedMenus];
        }),
        generateFlattenedMenuMap: computed<FlattenedMenuMap>(() => {
            const map: FlattenedMenuMap = {};

            const getSubMenuIdsToMap = (menu: Menu, flattenedMenuMap: FlattenedMenuMap) => {
                let results: MenuId[] = [];
                const subMenuList = menu.subMenuList;
                if (subMenuList) {
                    results = subMenuList.map((d) => d.id);
                    subMenuList.forEach((subMenu) => {
                        getSubMenuIdsToMap(subMenu, flattenedMenuMap);
                    });
                }
                flattenedMenuMap[menu.id] = results;
            };

            getters.menuList.forEach((menu) => {
                getSubMenuIdsToMap(menu, map);
            });

            return map;
        }),
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
    };

    return {
        state,
        getters,
        ...actions,
    };
});
