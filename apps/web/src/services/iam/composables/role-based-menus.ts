import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useMenuStore } from '@/store/menu/menu-store';

import type { Menu } from '@/lib/menu/config';
import { DEFAULT_MENU_LIST } from '@/lib/menu/menu-architecture';

interface RoleBasedMenus {
    roleBasedMenus: ComputedRef<Menu[]>;
}

export const useRoleBasedMenus = (): RoleBasedMenus => {
    const menuStore = useMenuStore();

    const baseWorkspaceMenus = computed(() => menuStore.getters.baseWorkspaceMenus);

    const filterMenus = (source: Menu[], exclude: Menu[]): Menu[] => {
        const excludeMap = new Map<string, Menu>(exclude.map((item) => [item.id, item]));

        return source
            .filter((item) => !excludeMap.has(item.id))
            .map((item) => {
                if (item.subMenuList) {
                    const matched = excludeMap.get(item.id);
                    const excludedSub = matched?.subMenuList || [];
                    return {
                        ...item,
                        subMenuList: filterMenus(item.subMenuList, excludedSub),
                    };
                }
                return item;
            });
    };

    return {
        roleBasedMenus: computed(() => filterMenus(baseWorkspaceMenus.value, DEFAULT_MENU_LIST)),
    };
};
