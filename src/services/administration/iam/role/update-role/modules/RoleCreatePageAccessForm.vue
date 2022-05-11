<template>
    <p-pane-layout class="role-create-page-access-form">
        <p-panel-top>
            <!-- song-lang -->
            Page Access
        </p-panel-top>
        <div class="page-access-menu">
            <div class="header-wrapper">
                <span class="left-part">Menu</span>
                <span class="right-part">Permission</span>
            </div>
            <div class="content-wrapper">
                <template v-for="menu in formState.menuItems">
                    <div v-if="menu.id === 'all' || !hideAllMenu" :key="menu.id"
                         class="menu-wrapper"
                         :class="menu.id"
                    >
                        <role-create-page-access-menu-item :menu="menu" @update="handleUpdate" />
                        <template v-for="subMenu in menu.subMenuList">
                            <div v-if="menu.subMenuList && !menu.hideMenu && !hideAllMenu" :key="subMenu.id"
                                 class="sub-menu-wrapper"
                            >
                                <role-create-page-access-menu-item :menu="subMenu"
                                                                   :is-sub-menu="true"
                                                                   @update="handleUpdate"
                                />
                            </div>
                        </template>
                    </div>
                </template>
            </div>
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import { find } from 'lodash';
import { TranslateResult } from 'vue-i18n';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PPaneLayout, PPanelTop } from '@spaceone/design-system';
import { GNBMenu, GNBMenu as GNBMenuType } from '@/store/modules/display/type';
import { store } from '@/store';
import { MENU_ID } from '@/lib/menu/config';
import RoleCreatePageAccessMenuItem
    from '@/services/administration/iam/role/update-role/modules/RoleCreatePageAccessMenuItem.vue';
import { PageAccessMenuItem } from '@/services/administration/iam/role/type';


const EXCEPTION_MENU = [MENU_ID.PROJECT, MENU_ID.MY_PAGE];
const flattenSubMenuList = (subMenuList?: GNBMenu[], labels?: Array<string|TranslateResult>): PageAccessMenuItem[] => {
    if (!subMenuList) return [];
    let results: PageAccessMenuItem[] = [];
    subMenuList.forEach((subMenu) => {
        if (subMenu.subMenuList?.length) {
            results = results.concat(flattenSubMenuList(subMenu.subMenuList, [...labels || [], subMenu.label]));
        } else {
            results.push({
                id: subMenu.id,
                labels: [...labels || [], subMenu.label],
                isViewed: false,
                isManaged: false,
                hideMenu: false,
            });
        }
    });
    return results;
};

export default {
    name: 'RoleCreatePageAccessForm',
    components: {
        RoleCreatePageAccessMenuItem,
        PPaneLayout,
        PPanelTop,
    },
    setup() {
        const formState = reactive({
            isAllManaged: false,
            isAllViewed: false,
            menuItems: [] as PageAccessMenuItem[],
        });
        const state = reactive({
            allMenuList: computed<GNBMenuType[]>(() => {
                const allMenu = store.getters['display/allGnbMenuList'];
                return allMenu.filter(d => !EXCEPTION_MENU.includes(d.id));
            }),
            menuVisibleMap: {},
            hideAllMenu: computed(() => formState.menuItems.find(d => d.id === 'all')?.hideMenu),
        });

        /* Event */
        const handleUpdate = (menuId, key, val) => {
            const item = find(formState.menuItems, { id: menuId });
            if (item) item[key] = val;
            else {
                formState.menuItems.forEach((menuItem) => {
                    if (menuItem?.subMenuList) {
                        const subItem = find(menuItem.subMenuList, { id: menuId });
                        if (subItem) subItem[key] = val;
                    }
                });
            }
        };

        /* Init */
        (async () => {
        })();

        /* Watcher */
        watch(() => state.allMenuList, (menuList) => {
            if (menuList.length) {
                formState.menuItems = [
                    {
                        id: 'all',
                        // song-lang
                        labels: ['All'],
                        isViewed: false,
                        isManaged: false,
                        hideMenu: false,
                    },
                    ...menuList.map(menu => ({
                        id: menu.id,
                        labels: [menu.label],
                        isViewed: false,
                        isManaged: false,
                        hideMenu: false,
                        subMenuList: flattenSubMenuList(menu?.subMenuList),
                    })),
                ];
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            formState,
            handleUpdate,
        };
    },
};
</script>

<style lang="postcss" scoped>
.role-create-page-access-form {
    @apply mx-0;
    max-width: 100%;

    .page-access-menu {
        @apply border border-gray-200 rounded-md;
        font-size: 0.875rem;
        line-height: 1.25;
        max-width: 43.5rem;
        margin: 0 1rem 2.5rem 1rem;

        .header-wrapper {
            @apply text-gray-500 border-b border-gray-200;
            display: flex;
            font-size: 0.75rem;
            line-height: 1.25;
            padding: 0.5rem 1rem;
        }
        .content-wrapper {
            height: 27.875rem;
            overflow-y: auto;
        }
        .menu-wrapper {
            @apply bg-gray-100 border border-gray-200 rounded-md;
            margin: 0.5rem 1rem;
            &.all {
                @apply bg-transparent border-none;
                margin: 1.5rem 1rem 1.5rem 0;
            }
            .sub-menu-wrapper {
                @apply bg-white rounded-md;
                margin: 0.25rem 0.5rem;
            }
        }
        .left-part {
            flex-grow: 1;
        }
        .right-part {
            width: 12.5rem;
        }
    }
}
</style>
