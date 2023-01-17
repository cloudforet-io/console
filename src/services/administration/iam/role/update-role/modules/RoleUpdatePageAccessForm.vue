<template>
    <p-pane-layout class="role-create-page-access-form">
        <p-panel-top>
            {{ $t('IAM.ROLE.DETAIL.PAGE_ACCESS') }}
        </p-panel-top>
        <div class="page-access-menu">
            <div class="header-wrapper">
                <span class="left-part">{{ $t('IAM.ROLE.FORM.MENU') }}</span>
                <span class="right-part mr-6">{{ $t('IAM.ROLE.FORM.PERMISSION') }}</span>
            </div>
            <div class="content-wrapper">
                <template v-for="menu in formState.menuItems">
                    <div v-if="menu.id === 'all' || !hideAllMenu"
                         :key="menu.id"
                         class="menu-wrapper"
                         :class="menu.id"
                    >
                        <role-update-page-access-menu-item :menu="menu"
                                                           @update="handleUpdate"
                        />
                        <template v-for="subMenu in menu.subMenuList">
                            <div v-if="menu.subMenuList && !menu.hideMenu && !hideAllMenu"
                                 :key="subMenu.id"
                                 class="sub-menu-wrapper"
                            >
                                <role-update-page-access-menu-item :menu="subMenu"
                                                                   is-sub-menu
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

import type { PropType } from 'vue';
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import { PPaneLayout, PPanelTop } from '@spaceone/design-system';
import { find, isEqual } from 'lodash';

import type { RawPagePermission } from '@/lib/access-control/config';
import { PAGE_PERMISSION_TYPE } from '@/lib/access-control/config';
import {
    getPagePermissionMapFromRaw,
} from '@/lib/access-control/page-permission-helper';
import config from '@/lib/config';
import { MENU_ID } from '@/lib/menu/config';

import type { RoleType } from '@/services/administration/iam/role/config';
import { ROLE_TYPE } from '@/services/administration/iam/role/config';
import { getPageAccessMenuList } from '@/services/administration/iam/role/lib/page-access-menu-list';
import type { PageAccessMenuItem } from '@/services/administration/iam/role/type';
import RoleUpdatePageAccessMenuItem
    from '@/services/administration/iam/role/update-role/modules/RoleUpdatePageAccessMenuItem.vue';


const getIndividualPagePermissions = (menuItem: PageAccessMenuItem): RawPagePermission[] => {
    if (menuItem.id === 'all') return [];

    // MANAGE permission for menu group
    if (menuItem.isManaged) {
        if (menuItem.subMenuList?.length) {
            return menuItem.subMenuList.map((subMenu) => ({ page: subMenu.id, permission: PAGE_PERMISSION_TYPE.MANAGE }));
        }
        return [{ page: menuItem.id, permission: PAGE_PERMISSION_TYPE.MANAGE }];
    }

    // VIEW permission for menu group
    if (menuItem.isViewed) {
        if (menuItem.subMenuList?.length) {
            // Menu group with VIEW permission can contain sub menu whose permission is MANAGE.
            return menuItem.subMenuList.map((subMenu) => ({ page: subMenu.id, permission: subMenu.isManaged ? PAGE_PERMISSION_TYPE.MANAGE : PAGE_PERMISSION_TYPE.VIEW }));
        }
        return [{ page: menuItem.id, permission: PAGE_PERMISSION_TYPE.VIEW }];
    }

    // each individual menu case
    if (menuItem.subMenuList?.length) {
        const results: RawPagePermission[] = [];
        menuItem.subMenuList.forEach((subMenu) => {
            if (!subMenu.isManaged && !subMenu.isViewed) return;
            const permission = subMenu.isManaged ? PAGE_PERMISSION_TYPE.MANAGE : PAGE_PERMISSION_TYPE.VIEW;
            results.push({ page: subMenu.id, permission });
        });
        return results;
    }

    return [];
};


const getPagePermissions = (menuItems: PageAccessMenuItem[], roleType: RoleType): RawPagePermission[] => {
    // all case
    const allItem = find(menuItems, { id: 'all' });
    if (allItem && (allItem.isManaged || allItem.isViewed)) {
        const permission = allItem.isManaged ? PAGE_PERMISSION_TYPE.MANAGE : PAGE_PERMISSION_TYPE.VIEW;
        if (roleType === ROLE_TYPE.PROJECT) {
            // wildcard is not available for PROJECT role type
            return menuItems.map((menuItem) => getIndividualPagePermissions(menuItem)).flat();
        }
        return [{ page: '*', permission }];
    }

    let results: RawPagePermission[] = [];
    menuItems.forEach((menu) => {
        // PROJECT role type case
        if (roleType === ROLE_TYPE.PROJECT) {
            results = results.concat(getIndividualPagePermissions(menu));
            return;
        }

        // MANAGE permission for menu group
        if (menu.isManaged) {
            results.push({ page: `${menu.id}.*`, permission: PAGE_PERMISSION_TYPE.MANAGE });
            return;
        }

        // VIEW permission for menu group
        if (menu.isViewed) {
            results.push({ page: `${menu.id}.*`, permission: PAGE_PERMISSION_TYPE.VIEW });
            // Menu group with VIEW permission can contain sub menu whose permission is MANAGE.
            menu.subMenuList?.forEach((subMenu) => {
                if (subMenu.isManaged) results.push({ page: subMenu.id, permission: PAGE_PERMISSION_TYPE.MANAGE });
            });
            return;
        }

        // each individual menu case
        menu.subMenuList?.forEach((subMenu) => {
            if (!subMenu.isManaged && !subMenu.isViewed) return;
            const permission = subMenu.isManaged ? PAGE_PERMISSION_TYPE.MANAGE : PAGE_PERMISSION_TYPE.VIEW;
            results.push({ page: subMenu.id, permission });
        });
    });

    return results;
};

export default {
    name: 'RoleUpdatePageAccessForm',
    components: {
        RoleUpdatePageAccessMenuItem,
        PPaneLayout,
        PPanelTop,
    },
    props: {
        initialPagePermissions: {
            type: Array as PropType<RawPagePermission[]>,
            default: () => ([]),
        },
        roleType: {
            type: String as PropType<RoleType>,
            default: ROLE_TYPE.PROJECT,
            validator(roleType: RoleType) {
                return Object.values(ROLE_TYPE).includes(roleType);
            },
        },
    },
    setup(props, { emit }) {
        const formState = reactive({
            menuItems: getPageAccessMenuList([{
                id: 'all',
                translationIds: ['IAM.ROLE.FORM.ALL'],
                isViewed: false,
                isManaged: false,
                hideMenu: false,
            }]).filter((menu) => {
                if (menu.id === MENU_ID.DASHBOARDS) {
                    return config.get('DASHBOARD_ENABLED');
                }
                return true;
            }),
        });
        const state = reactive({
            hideAllMenu: computed(() => formState.menuItems.find((d) => d.id === 'all')?.hideMenu),
            pagePermissions: computed<RawPagePermission[]>(() => getPagePermissions(formState.menuItems, props.roleType)),
        });

        /* Util */
        const updateMenuItems = (item: PageAccessMenuItem, key: string, val: boolean, parentItem?: PageAccessMenuItem) => {
            item[key] = val;
            if (key === 'isManaged') item.isViewed = val;
            if (parentItem && !val) {
                parentItem[key] = val;
                parentItem.isViewed = false;
            }
            if (item?.subMenuList?.length) {
                item.subMenuList.forEach((subMenu) => {
                    if (key === 'isViewed' && subMenu.isManaged) return;
                    if (key === 'isManaged') subMenu.isViewed = val;
                    subMenu[key] = val;
                });
            }
        };

        /* Event */
        const handleUpdate = (menuId: string, key: 'isViewed' | 'isManaged', val: boolean) => {
            const item = find(formState.menuItems, { id: menuId });
            const allItem = find(formState.menuItems, { id: 'all' }) as PageAccessMenuItem;
            if (item) {
                if (item.id === 'all') {
                    formState.menuItems.forEach((menu) => {
                        updateMenuItems(menu, key, val);
                    });
                } else {
                    updateMenuItems(item, key, val, allItem);
                }
            } else {
                formState.menuItems.forEach((menuItem) => {
                    if (menuItem?.subMenuList?.length) {
                        const subItem = find(menuItem.subMenuList, { id: menuId });
                        if (subItem) {
                            updateMenuItems(subItem, key, val, menuItem);
                            if (menuItem.subMenuList.every((d) => d[key])) updateMenuItems(menuItem, key, val);
                            if (!val) updateMenuItems(allItem, key, val); // deactivate 'all' menu
                        }
                    }
                });
            }

            // activate 'all' menu if every menu were activated
            const menus = formState.menuItems.filter((d) => d.id !== 'all');
            if (menus.every((d) => d[key])) {
                updateMenuItems(allItem, key, val);
            }
        };

        /* Watcher */
        watch(() => state.pagePermissions, (pagePermissions, prevPagePermissions) => {
            if (isEqual(pagePermissions, prevPagePermissions)) return;
            emit('update-form', pagePermissions);
        });
        watch(() => props.initialPagePermissions, (initialPagePermissions) => {
            // init formState.menuItems
            const pagePermissions = getPagePermissionMapFromRaw(initialPagePermissions);
            // eslint-disable-next-line no-restricted-syntax
            for (const [itemId, key] of Object.entries(pagePermissions)) {
                const itemAttribute = (key === PAGE_PERMISSION_TYPE.MANAGE) ? 'isManaged' : 'isViewed';
                handleUpdate(itemId, itemAttribute, true);
            }
        });

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
                margin: 0.5rem 1rem 0.5rem 0;
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
