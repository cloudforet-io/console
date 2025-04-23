<script lang="ts" setup>
import {
    computed, reactive, ref, watch,
} from 'vue';

import { find, isEqual } from 'lodash';

import { PPaneLayout } from '@cloudforet/mirinae';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleType } from '@/api-clients/identity/role/type';

import { useMenuStore } from '@/store/menu/menu-store';

import { PAGE_ACCESS } from '@/lib/access-control/config';
import { getPageAccessMapFromRawData } from '@/lib/access-control/page-access-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

import RoleUpdateFormAccess from '@/services/iam/components/RoleUpdateFormAccess.vue';
import RoleUpdateFormPolicy from '@/services/iam/components/RoleUpdateFormPolicy.vue';
import { FORM_TYPE } from '@/services/iam/constants/role-constant';
import { getPageAccessList, getPageAccessMenuListByRoleType } from '@/services/iam/helpers/role-page-access-menu-list';
import type { PageAccessMenuItem, RoleFormData } from '@/services/iam/types/role-type';

interface Props {
    initialPageAccess?: string[];
    initialPermissions?: string[];
    roleType?: RoleType;
    isPageAccessValid?: boolean;
    formType?: string;
}

const props = withDefaults(defineProps<Props>(), {
    initialPageAccess: undefined,
    initialPermissions: undefined,
    roleType: ROLE_TYPE.WORKSPACE_OWNER,
    isPageAccessValid: true,
    isPolicyValid: true,
    formType: FORM_TYPE.CREATE,
});

const menuStore = useMenuStore();

const emit = defineEmits<{(e: 'update-form', formData: RoleFormData): void,
    (e: 'update:is-page-access-valid', value: boolean): void,
    (e: 'update:is-policy-valid', value: boolean): void,
}>();

const menuItems = ref([] as PageAccessMenuItem[]);
const state = reactive({
    pageAccessPermissions: computed(() => getPageAccessList(menuItems.value)),
    proxyPageAccessValid: useProxyValue('isPageAccessValid', props, emit),
    policy: '' as string|undefined,
    proxyPolicyValid: useProxyValue('isPolicyValid', props, emit),
    selectedRadioIdx: 0,
});

/* Components */
const handleUpdateForm = (value: PageAccessMenuItem, isInit?: boolean) => {
    const { id: menuId, isAccessible, accessType } = value;
    const item = find(menuItems.value, { id: menuId });
    if (item) {
        if (accessType) {
            item.accessType = accessType;
            item.subMenuList?.forEach((d) => {
                d.isAccessible = true;
            });
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
            menuItem.isValid = !menuItem?.subMenuList.every((d) => !d.isAccessible);

            const subItem = find(menuItem.subMenuList, { id: menuId });
            if (subItem) {
                subItem.isAccessible = menuItem.accessType !== PAGE_ACCESS.RESTRICTED ? isAccessible : true;
            }
        }
    });

    state.proxyPageAccessValid = menuItems.value.every((i) => i.isValid);
};
const handleUpdateEditor = (value: string) => {
    state.policy = value;
    if (state.selectedRadioIdx === 0) return;
    state.proxyPolicyValid = state.policy !== '';
};
const setPageAccessPermissionsData = () => {
    if (!props.initialPageAccess) return;
    const pageAccessPermissionMap = getPageAccessMapFromRawData({
        pageAccessPermissions: props.initialPageAccess, isRolePage: true, menuList: menuStore.getters.menuList,
    });
    // eslint-disable-next-line no-restricted-syntax
    for (const [itemId, accessible] of Object.entries(pageAccessPermissionMap)) {
        if (!itemId) return;
        let accessType = '';
        if (accessible.read && accessible.write) {
            accessType = PAGE_ACCESS.WRITABLE;
        } else if (accessible.read && !accessible.write) {
            accessType = PAGE_ACCESS.READONLY;
        } else {
            accessType = PAGE_ACCESS.RESTRICTED;
        }
        handleUpdateForm({
            id: itemId,
            isAccessible: accessible.access,
            accessType,
        }, true);
    }
};

/* Watcher */
watch(() => state.selectedRadioIdx, (selectedRadioIdx) => {
    if (selectedRadioIdx === 0) {
        state.policy = undefined;
    }
    state.proxyPolicyValid = selectedRadioIdx === 0 ? true : state.policy;
});
watch(() => state.policy, (policy) => {
    emit('update-form', { permissions: policy ? policy.split('\n') : [] });
});
watch(() => state.pageAccessPermissions, (pageAccessPermissions, prevPageAccessPermissions) => {
    if (isEqual(pageAccessPermissions, prevPageAccessPermissions)) return;
    emit('update-form', { page_access: pageAccessPermissions });
});
watch([() => props.roleType, () => props.initialPageAccess], ([roleType]) => {
    menuItems.value = getPageAccessMenuListByRoleType(roleType);
    setPageAccessPermissionsData();
}, { immediate: true });
</script>

<template>
    <p-pane-layout class="role-create-page-permission-form">
        <role-update-form-access :menu-items="menuItems"
                                 :role-type="props.roleType"
                                 @update="handleUpdateForm"
        />
        <role-update-form-policy :role-type="props.roleType"
                                 :initial-permissions="props.initialPermissions"
                                 :selected-radio-idx.sync="state.selectedRadioIdx"
                                 @update="handleUpdateEditor"
        />
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.role-create-page-permission-form {
    max-width: 100%;
}
</style>
