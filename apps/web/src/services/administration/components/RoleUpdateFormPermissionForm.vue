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
import { MENU_LIST } from '@/lib/menu/menu-architecture';

import RoleUpdateFormAccess from '@/services/administration/components/RoleUpdateFormAccess.vue';
import RoleUpdateFormPolicy from '@/services/administration/components/RoleUpdateFormPolicy.vue';
import { getPageAccessMenuList } from '@/services/administration/helpers/page-access-menu-list';
import { getPagePermissions } from '@/services/administration/helpers/role-page-permission-helpert';
import type { PageAccessMenuItem, UpdateFormDataType } from '@/services/administration/types/page-access-menu-type';

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
const handleUpdate = (value: UpdateFormDataType) => {
    const { id: menuId, key, val } = value;
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
    const pagePermissions = getPagePermissionMapFromRaw(initialPagePermissions, MENU_LIST);
    // eslint-disable-next-line no-restricted-syntax
    for (const [itemId, key] of Object.entries(pagePermissions)) {
        const itemAttribute = (key === PAGE_PERMISSION_TYPE.MANAGE) ? 'isManaged' : 'isViewed';
        handleUpdate({ id: itemId, key: itemAttribute, val: true });
    }
});
</script>

<template>
    <p-pane-layout class="role-create-page-permission-form">
        <p-heading heading-type="sub"
                   :title="$t('IAM.ROLE.FORM.PERMISSION')"
        />
        <role-update-form-access :menu-items="formState.menuItems"
                                 @update="handleUpdate"
        />
        <role-update-form-policy />
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.role-create-page-permission-form {
    @apply mx-0;
}
</style>
