<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { PPaneLayout, PHeading } from '@spaceone/design-system';
import { find, isEqual } from 'lodash';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleType } from '@/schema/identity/role/type';

import type { PagePermission } from '@/lib/access-control/config';
import { PAGE_PERMISSION_TYPE } from '@/lib/access-control/config';
import {
    getPagePermissionMapFromRaw,
} from '@/lib/access-control/page-permission-helper';

import RoleUpdatePageAccessMenuItem from '@/services/administration/components/RoleUpdatePageAccessMenuItem.vue';
import { getPageAccessMenuList } from '@/services/administration/helpers/page-access-menu-list';
import { getPagePermissions } from '@/services/administration/helpers/role-page-permission-helpert';
import type { PageAccessMenuItem } from '@/services/administration/types/page-access-menu-type';

interface Props {
    initialPagePermissions?: PagePermission[];
    roleType?: RoleType;
}

const props = withDefaults(defineProps<Props>(), {
    initialPagePermissions: undefined,
    roleType: ROLE_TYPE.WORKSPACE_OWNER,
});

const emit = defineEmits<{(e: 'update-form', after: PagePermission[]): void,
}>();

const state = reactive({
    hideAllMenu: computed(() => formState.menuItems.find((d) => d.id === 'all')?.hideMenu),
    pagePermissions: computed<PagePermission[]>(() => getPagePermissions(formState.menuItems, props.roleType)),
});
const formState = reactive({
    menuItems: getPageAccessMenuList([{
        id: 'all',
        translationIds: ['IAM.ROLE.FORM.ALL'],
        isViewed: false,
        isManaged: false,
        hideMenu: false,
    }]),
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
</script>

<template>
    <p-pane-layout class="role-create-page-access-form">
        <p-heading heading-type="sub"
                   :title="$t('IAM.ROLE.DETAIL.PAGE_ACCESS')"
        />
        <div class="page-access-menu">
            <div class="header-wrapper">
                <span class="left-part">{{ $t('IAM.ROLE.FORM.MENU') }}</span>
                <span class="right-part mr-6">{{ $t('IAM.ROLE.FORM.PERMISSION') }}</span>
            </div>
            <div class="content-wrapper">
                <template v-for="menu in formState.menuItems">
                    <div v-if="menu.id === 'all' || !state.hideAllMenu"
                         :key="menu.id"
                         class="menu-wrapper"
                         :class="menu.id"
                    >
                        <role-update-page-access-menu-item :menu="menu"
                                                           @update="handleUpdate"
                        />
                        <template v-for="subMenu in menu.subMenuList">
                            <div v-if="menu.subMenuList && !menu.hideMenu && !state.hideAllMenu"
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
