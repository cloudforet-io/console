<script lang="ts" setup>
import {
    computed, reactive, ref, watch, watchEffect,
} from 'vue';

import { find, isEqual } from 'lodash';

import { PPaneLayout, PHeading } from '@cloudforet/mirinae';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleType } from '@/schema/identity/role/type';

import {
    getPageAccessPermissionMapFromRawData,
} from '@/lib/access-control/page-access-helper';

import RoleUpdateFormAccess from '@/services/iam/components/RoleUpdateFormAccess.vue';
import RoleUpdateFormPolicy from '@/services/iam/components/RoleUpdateFormPolicy.vue';
import {
    getPageAccessMenuListByRoleType,
    getPageAccessList,
} from '@/services/iam/helpers/role-page-access-menu-list';
import type { PageAccessMenuItem, RoleFormData } from '@/services/iam/types/role-type';

interface Props {
    initialPageAccess?: string[];
    initialPermissions?: string[];
    roleType?: RoleType;
}

const props = withDefaults(defineProps<Props>(), {
    initialPageAccess: undefined,
    initialPermissions: undefined,
    roleType: ROLE_TYPE.WORKSPACE_OWNER,
});

const emit = defineEmits<{(e: 'update-form', formData: RoleFormData): void,
}>();

const menuItems = ref([] as PageAccessMenuItem[]);
const state = reactive({
    pageAccessPermissions: computed(() => getPageAccessList(menuItems.value)),
});

/* Components */
const handleUpdateForm = (value: PageAccessMenuItem, isInit?: boolean) => {
    const { id: menuId, isAccessible, accessType } = value;
    const item = find(menuItems.value, { id: menuId });
    if (item) {
        if (accessType) {
            item.accessType = accessType;
        }
        if (isInit && item.subMenuList?.length === 0) {
            item.subMenuList?.push({
                id: item.id,
                isAccessible: item.isAccessible,
                translationIds: item.translationIds,
            });
        }
    }
    menuItems.value.forEach((menuItem) => {
        if (menuItem?.subMenuList?.length) {
            const subItem = find(menuItem.subMenuList, { id: menuId });
            if (subItem) {
                subItem.isAccessible = isAccessible;
            }
        }
    });
};
const handleUpdateEditor = (value: string) => {
    emit('update-form', { permissions: value.split('\n') });
};

/* Watcher */
watch(() => state.pageAccessPermissions, (pageAccessPermissions, prevPageAccessPermissions) => {
    if (isEqual(pageAccessPermissions, prevPageAccessPermissions)) return;
    emit('update-form', { page_access: pageAccessPermissions });
});
watchEffect(() => {
    menuItems.value = getPageAccessMenuListByRoleType(props.roleType);

    if (!props.initialPageAccess) return;
    const pageAccessPermissionMap = getPageAccessPermissionMapFromRawData(props.initialPageAccess);
    // eslint-disable-next-line no-restricted-syntax
    for (const [itemId, accessible] of Object.entries(pageAccessPermissionMap)) {
        handleUpdateForm({ id: itemId, isAccessible: accessible }, true);
    }
});
</script>

<template>
    <p-pane-layout class="role-create-page-permission-form">
        <p-heading heading-type="sub"
                   :title="$t('IAM.ROLE.FORM.PERMISSION')"
                   class="heading"
        />
        <role-update-form-access :menu-items="menuItems"
                                 :role-type="props.roleType"
                                 @update="handleUpdateForm"
        />
        <role-update-form-policy :role-type="props.roleType"
                                 :initial-permissions="props.initialPermissions"
                                 @update="handleUpdateEditor"
        />
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.role-create-page-permission-form {
    @apply mx-0;
    .heading {
        margin-bottom: 1.5rem;
    }
}
</style>
