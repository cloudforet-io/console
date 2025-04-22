import { computed, reactive } from 'vue';

import { orderBy } from 'lodash';
import { defineStore } from 'pinia';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import type { DisplayMenu } from '@/store/display/type';

import type {
    GeneratedRouteSchema,
    GeneratedMenuSchema, GeneratedRouteMetadataSchema, GeneratedUiAffectSchema,
} from '@/lib/config/global-config/types/type';
import type { Menu, MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { DEFAULT_MENU_LIST, DEFAULT_ADMIN_MENU_LIST } from '@/lib/menu/menu-architecture';

import { useTaskManagementTemplateStore } from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

export type FlattenedMenuMap = Partial<Record<MenuId, MenuId[]>>;

interface GlobalConfigSchemaStoreState {
    uiAffectsSchema: GeneratedUiAffectSchema;
    menuSchema: GeneratedMenuSchema;
    routeMetadataSchema: GeneratedRouteMetadataSchema;
    routeSchema: GeneratedRouteSchema;
}

interface MenuTransformer {
    menuId: MenuId;
    transform: (menu: DisplayMenu, getters: any) => Partial<DisplayMenu>;
    shouldInclude?: (getters: any) => boolean;
}

const MENU_TRANSFORMERS_MAP = new Map<MenuId, MenuTransformer>([
    [MENU_ID.OPS_FLOW_LANDING, {
        menuId: MENU_ID.OPS_FLOW_LANDING,
        transform: (menu: DisplayMenu, getters: any) => ({
            label: getters.templateName,
        }),
        shouldInclude: (getters: any) => getters.templateId !== 'default' && getters.enableLanding,
    }],
    [MENU_ID.TASK_BOARD, {
        menuId: MENU_ID.TASK_BOARD,
        transform: (menu: DisplayMenu, getters: any) => ({
            label: getters.taskBoardName,
        }),
    }],
]);

export const useGlobalConfigSchemaStore = defineStore('global-config-schema-store', () => {
    const appContextStore = useAppContextStore();
    const taskManagementTemplateStore = useTaskManagementTemplateStore();

    const state = reactive<GlobalConfigSchemaStoreState>({
        uiAffectsSchema: {} as GeneratedUiAffectSchema,
        menuSchema: {} as GeneratedMenuSchema,
        routeMetadataSchema: {} as GeneratedRouteMetadataSchema,
        routeSchema: {} as GeneratedRouteSchema,
    });

    const _getters = reactive({
        isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
        templateName: computed<string>(() => taskManagementTemplateStore.templates.TemplateName),
        taskBoardName: computed<string>(() => taskManagementTemplateStore.templates.TaskBoard),
        templateId: computed<string>(() => taskManagementTemplateStore.state.templateId),
        enableLanding: computed<boolean>(() => taskManagementTemplateStore.state.enableLanding),
    });

    const baseMenuList = computed<Menu[]>(() => {
        const menuList: Menu[] = _getters.isAdminMode ? [] : [...DEFAULT_MENU_LIST];

        Object.values(state.menuSchema).forEach((featureSetting) => {
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

        return menuList;
    });

    const transformSubMenu = (subMenu: DisplayMenu): DisplayMenu | null => {
        const transformer = MENU_TRANSFORMERS_MAP.get(subMenu.id);
        if (!transformer) return subMenu;
        if (transformer.shouldInclude && !transformer.shouldInclude(_getters)) return null;

        return {
            ...subMenu,
            ...transformer.transform(subMenu, _getters),
        };
    };

    const transformMenu = (menu: DisplayMenu): DisplayMenu => {
        if (!menu.subMenuList) return menu;

        const transformedSubMenus = menu.subMenuList
            .map(transformSubMenu)
            .filter((subMenu): subMenu is DisplayMenu => subMenu !== null);

        return {
            ...menu,
            subMenuList: transformedSubMenus,
        };
    };

    const getters = reactive({
        menuList: computed<Menu[]>(() => {
            const refinedMenuList = baseMenuList.value
                .map((menu) => transformMenu(menu as DisplayMenu));

            const orderedMenus = refinedMenuList.filter((menu) => menu.order !== undefined);
            const unorderedMenus = refinedMenuList.filter((menu) => menu.order === undefined);

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
        setRouteSchema(routeSchema: GeneratedRouteSchema) {
            state.routeSchema = routeSchema;
        },
    };

    return {
        state,
        getters,
        ...actions,
    };
});
