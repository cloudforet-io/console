import { computed, reactive } from 'vue';

import { orderBy } from 'lodash';
import { defineStore } from 'pinia';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useGlobalConfigSchemaStore } from '@/store/global-config-schema/global-config-schema-store';
import type { DisplayMenu } from '@/store/menu/type';
import { pinia } from '@/store/pinia';

import { MENU_ID } from '@/lib/menu/config';
import type { Menu, MenuId } from '@/lib/menu/config';
import { DEFAULT_ADMIN_MENU_LIST, DEFAULT_MENU_LIST } from '@/lib/menu/menu-architecture';

import { useTaskManagementTemplateStore } from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

export type FlattenedMenuMap = Partial<Record<MenuId, MenuId[]>>;

interface MenuContext {
    templateName: string;
    taskBoardName: string;
    templateId: string;
    enableLanding: boolean;
}
interface MenuCustomization {
    menuId: MenuId;
    applyLabel: (menu: DisplayMenu, context: MenuContext) => Partial<DisplayMenu>;
    shouldShow?: (context: MenuContext) => boolean;
}

const MENU_CUSTOMIZATIONS = new Map<MenuId, MenuCustomization>([
    [MENU_ID.OPS_FLOW_LANDING, {
        menuId: MENU_ID.OPS_FLOW_LANDING,
        applyLabel: (menu, ctx) => ({ label: ctx.templateName }),
        shouldShow: (ctx) => ctx.templateId !== 'default' && ctx.enableLanding,
    }],
    [MENU_ID.TASK_BOARD, {
        menuId: MENU_ID.TASK_BOARD,
        applyLabel: (menu, ctx) => ({ label: ctx.taskBoardName }),
    }],
]);

export const useMenuStore = defineStore('derived-menu', () => {
    const globalConfigSchemaStore = useGlobalConfigSchemaStore(pinia);
    const appContextStore = useAppContextStore(pinia);

    const _isAdminMode = computed(() => appContextStore.getters.isAdminMode);

    const taskManagementTemplateStore = useTaskManagementTemplateStore(pinia);
    const _menuContext = computed<MenuContext>(() => ({
        templateName: taskManagementTemplateStore.templates.TemplateName,
        taskBoardName: taskManagementTemplateStore.templates.TaskBoard,
        templateId: taskManagementTemplateStore.state.templateId,
        enableLanding: taskManagementTemplateStore.state.enableLanding,
    }));
    const _baseMenuList = computed<Menu[]>(() => {
        const menuList: Menu[] = _isAdminMode.value ? [] : [...DEFAULT_MENU_LIST];

        Object.values(globalConfigSchemaStore.state.menuSchema).forEach((featureSetting) => {
            if (featureSetting) {
                const menu = _isAdminMode.value ? featureSetting.adminMenu : featureSetting.menu;
                if (menu && !menuList.some((existingMenu) => existingMenu.id === menu.id)) {
                    menuList.push(menu);
                }
            }
        });

        if (_isAdminMode.value) {
            menuList.push(...DEFAULT_ADMIN_MENU_LIST);
        }

        return menuList;
    });


    const getters = reactive({
        menuList: computed(() => {
            const refinedMenuList = _baseMenuList.value
                .map((menu) => _applyCustomizations(menu as DisplayMenu, _menuContext.value));

            const orderedMenus = refinedMenuList.filter((menu) => menu.order !== undefined);
            const unorderedMenus = refinedMenuList.filter((menu) => menu.order === undefined);

            return [...orderBy(orderedMenus, ['order'], ['asc']), ...unorderedMenus];
        }),
        generateFlattenedMenuMap: computed<FlattenedMenuMap>(() => {
            const map: FlattenedMenuMap = {};

            getters.menuList.forEach((menu) => {
                _getSubMenuIdsToMap(menu, map);
            });

            return map;
        }),
    });

    return {
        getters,
    };
});

/* menu list utils */
const _applyCustomizations = (menu: DisplayMenu, context: MenuContext): DisplayMenu => {
    const transformedSubMenus = (menu.subMenuList ?? [])
        .map((sub) => _customizeSubMenu(sub, context))
        .filter((sub): sub is DisplayMenu => sub !== null);

    return {
        ...menu,
        subMenuList: transformedSubMenus,
    };
};

const _customizeSubMenu = (subMenu: DisplayMenu, context: MenuContext): DisplayMenu | null => {
    const customizer = MENU_CUSTOMIZATIONS.get(subMenu.id);
    if (!customizer) return subMenu;

    if (customizer.shouldShow && !customizer.shouldShow(context)) return null;

    return {
        ...subMenu,
        ...customizer.applyLabel(subMenu, context),
    };
};

/* menu flattened map utils */
const _getSubMenuIdsToMap = (menu: Menu, flattenedMenuMap: FlattenedMenuMap) => {
    let results: MenuId[] = [];
    const subMenuList = menu.subMenuList;
    if (subMenuList) {
        results = subMenuList.map((d) => d.id);
        subMenuList.forEach((subMenu) => {
            _getSubMenuIdsToMap(subMenu, flattenedMenuMap);
        });
    }
    flattenedMenuMap[menu.id] = results;
};
