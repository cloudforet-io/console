<script lang="ts" setup>
import {
    computed, reactive, ref, watch, watchEffect,
} from 'vue';

import { PPaneLayout, PHeading } from '@spaceone/design-system';
import { find, isEqual } from 'lodash';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleType } from '@/schema/identity/role/type';

import {
    getPageAccessPermissionMapFromRawData,
} from '@/lib/access-control/page-access-permission-helper';

import RoleUpdateFormAccess from '@/services/administration/components/RoleUpdateFormAccess.vue';
import RoleUpdateFormPolicy from '@/services/administration/components/RoleUpdateFormPolicy.vue';
import {
    getPageAccessMenuListByRoleType,
} from '@/services/administration/helpers/page-access-menu-list';
import { getPageAccessList } from '@/services/administration/helpers/role-page-permission-helper';
import type { PageAccessMenuItem, UpdateFormDataType } from '@/services/administration/types/page-access-menu-type';

interface Props {
    initialPagePermissions?: string[];
    roleType?: RoleType;
}

const props = withDefaults(defineProps<Props>(), {
    initialPagePermissions: undefined,
    roleType: ROLE_TYPE.WORKSPACE_OWNER,
});

const emit = defineEmits<{(e: 'update-form', after: string[]): void,
    (e: 'update-editor', after: string[]): void,
}>();

const menuItems = ref([] as PageAccessMenuItem[]);
const state = reactive({
    pageAccessPermissions: computed(() => getPageAccessList(menuItems.value)),
});

/* Components */
const updateMenuItems = (item: PageAccessMenuItem, val: boolean, parentItem?: PageAccessMenuItem) => {
    item.isAccessible = val;
    if (parentItem && !val) parentItem.isAccessible = val;
    if (item?.subMenuList?.length) {
        item.subMenuList.forEach((subMenu) => {
            subMenu.isAccessible = val;
        });
    }
};
const handleUpdateForm = (value: UpdateFormDataType) => {
    const { id: menuId, val, isHideMenu } = value;
    const item = find(menuItems.value, { id: menuId });
    const allItem = find(menuItems.value, { id: 'all' }) as PageAccessMenuItem;
    if (item) {
        if (isHideMenu) {
            item.hideMenu = val;
        } else if (item.id === 'all') {
            menuItems.value.forEach((menu) => {
                updateMenuItems(menu, val);
            });
        } else {
            updateMenuItems(item, val, allItem);
        }
    } else {
        menuItems.value.forEach((menuItem) => {
            if (menuItem?.subMenuList?.length) {
                const subItem = find(menuItem.subMenuList, { id: menuId });
                if (subItem) {
                    updateMenuItems(subItem, val, menuItem);
                    if (menuItem.subMenuList.every((d) => d.isAccessible)) updateMenuItems(menuItem, val);
                    if (!val) updateMenuItems(allItem, val); // deactivate 'all' menu
                }
            }
        });
    }

    // activate 'all' menu if every menu were activated
    const menus = menuItems.value.filter((d) => d.id !== 'all');
    if (menus.every((d) => d.isAccessible)) {
        updateMenuItems(allItem, val);
    }
};
const handleUpdateEditor = (value: string) => {
    emit('update-editor', value.split('\n'));
};

/* Watcher */
watch(() => state.pageAccessPermissions, (pageAccessPermissions, prevPageAccessPermissions) => {
    if (isEqual(pageAccessPermissions, prevPageAccessPermissions)) return;
    emit('update-form', pageAccessPermissions);
});
watch(() => props.initialPagePermissions, (initialPagePermissions) => {
    // init formState.menuItems
    const pageAccessPermissionMap = getPageAccessPermissionMapFromRawData(initialPagePermissions);
    // eslint-disable-next-line no-restricted-syntax
    for (const [itemId, accessible] of Object.entries(pageAccessPermissionMap)) {
        handleUpdateForm({ id: itemId, val: accessible });
    }
}, { immediate: true });
watchEffect(() => {
    menuItems.value = getPageAccessMenuListByRoleType([{
        id: 'all',
        translationIds: ['IAM.ROLE.FORM.ALL'],
        isAccessible: false,
        hideMenu: false,
    }], props.roleType);
});
</script>

<template>
    <p-pane-layout class="role-create-page-permission-form">
        <p-heading heading-type="sub"
                   :title="$t('IAM.ROLE.FORM.PERMISSION')"
        />
        <role-update-form-access :menu-items="menuItems"
                                 @update="handleUpdateForm"
        />
        <role-update-form-policy @update="handleUpdateEditor" />
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.role-create-page-permission-form {
    @apply mx-0;
}
</style>
