import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { Menu, MenuId } from '@/lib/menu/config';

interface MenuStoreState {
    menuList: Menu[];
}
export type FlattenedMenuMap = Partial<Record<MenuId, MenuId[]>>;

export const useMenuStore = defineStore('menu-store', () => {
    const state = reactive<MenuStoreState>({
        menuList: [],
    });

    const getters = reactive({
        generateFlattenedMenuMap: computed(() => {
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

            state.menuList.forEach((menu) => {
                getSubMenuIdsToMap(menu, map);
            });

            return map;
        }),
    });

    const mutations = {
        setMenuList(value: Menu[]) {
            state.menuList = value;
        },
    };

    return {
        state,
        getters,
        ...mutations,
    };
});
