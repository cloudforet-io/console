<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { PDataTable, PBadge } from '@spaceone/design-system';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { RoleBindingListParameters, RoleBindingListResponse } from '@/schema/identity/role-binding/api-verbs/list';
import type { RoleBindingModel } from '@/schema/identity/role-binding/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { ROLE_TYPE_BADGE_OPTION } from '@/services/administration/constants/role-constant';
import { useRolePageStore } from '@/services/administration/store/role-page-store';

interface UnDeletableRole {
    roleName: string;
    roleDescription: string;
    roleType: string;
    assignTo: { resource_id: string; resource_type: string };
}

interface Props {
    visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const rolePageStore = useRolePageStore();

const emit = defineEmits<{(e: ':update:visible'): void,
    (e: 'refresh'): void,
}>();

const state = reactive({
    users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
    loading: true,
    proxyVisible: useProxyValue('visible', props, emit),
    fields: [
        { name: 'name', label: 'Name' },
        { name: 'tags.description', label: 'Description' },
        { name: 'role_type', label: 'Role Type' },
        { name: 'created_at', label: 'Created' },
    ] as DataTableField[],
    unDeletableRoles: [] as UnDeletableRole[],
    unDeletableRoleFields: [
        { name: 'roleName', label: 'Role Name' },
        { name: 'roleDescription', label: 'Role Description' },
        { name: 'roleType', label: 'Role Type' },
        { name: 'assignTo', label: 'Assigned To' },
    ] as DataTableField[],
    isDeletable: computed(() => state.unDeletableRoles.length === 0),
    headerTitle: computed(() => (state.isDeletable ? i18n.t('IAM.ROLE.MODAL.DELETE_TITLE') : i18n.t('IAM.ROLE.MODAL.DELETE_TITLE_CANNOT'))),
});

const handleDelete = async () => {
    let isAllSucceed = true;
    await Promise.all(rolePageStore.selectedRoles.map(async (role) => {
        try {
            await rolePageStore.deleteRole({ role_id: role.role_id });
        } catch (e) {
            isAllSucceed = false;
        }
    }));
    if (isAllSucceed) {
        showSuccessMessage(i18n.t('IAM.ROLE.ALT_S_DELETE_ROLE'), '');
        state.proxyVisible = false;
        emit('refresh');
    }
};

const getRoleBindingList = () => Promise.all(rolePageStore.selectedRoles.map(async (role) => {
    try {
        const { results } = await SpaceConnector.clientV2.identity.roleBinding.list<RoleBindingListParameters, RoleBindingListResponse>({
            role_id: role.role_id,
        });
        const roleBindingList: UnDeletableRole[] = results?.map((roleBinding: RoleBindingModel) => ({
            roleName: role.name,
            roleDescription: role.tags?.description,
            roleType: role.role_type,
            assignTo: { resource_id: roleBinding.user_id, resource_type: 'identity.User' },
        })) ?? [];
        state.unDeletableRoles = state.unDeletableRoles.concat(roleBindingList);
    } catch (e) {
        ErrorHandler.handleError(e);
        state.unDeletableRoles = [];
    }
}));

(async () => {
    await Promise.allSettled([
        store.dispatch('reference/user/load'),
    ]);
})();

/* Watcher */
watch(() => state.proxyVisible, async (after) => {
    state.loading = true;
    if (after) {
        state.unDeletableRoles = [];
        await getRoleBindingList();
        state.loading = false;
    }
}, { immediate: true });
</script>

<template>
    <delete-modal :visible.sync="state.proxyVisible"
                  size="lg"
                  :header-title="state.headerTitle"
                  :hide-footer="!state.isDeletable"
                  :loading="state.loading"
                  :enable-scroll="true"
                  @confirm="handleDelete"
    >
        <template #delete-modal-body>
            <div v-if="!state.isDeletable"
                 class="mb-4"
            >
                {{ $t('IAM.ROLE.MODAL.DELETE_HELP_TEXT') }}
            </div>
            <p-data-table v-if="state.isDeletable"
                          class="role-data-table"
                          :items="rolePageStore.selectedRoles"
                          :fields="state.fields"
                          :loading="state.loading"
                          :table-custom-style="{ maxHeight: 'calc(100vh - 17.5rem)' }"
            >
                <template #col-role_type-format="{ value }">
                    <p-badge v-if="value"
                             badge-type="solid-outline"
                             :style-type="ROLE_TYPE_BADGE_OPTION[value].styleType"
                    >
                        {{ ROLE_TYPE_BADGE_OPTION[value] ? ROLE_TYPE_BADGE_OPTION[value].label : '' }}
                    </p-badge>
                </template>
                <template #col-tags.description-format="{ value }">
                    {{ value ? value : '--' }}
                </template>
            </p-data-table>
            <p-data-table v-else
                          :items="state.unDeletableRoles"
                          :fields="state.unDeletableRoleFields"
                          :loading="state.loading"
                          :table-custom-style="{ maxHeight: 'calc(100vh - 19.5rem)' }"
            >
                <template #col-roleDescription-format="{ value }">
                    {{ value ? value : '--' }}
                </template>
                <template #col-roleType-format="{ value }">
                    <p-badge v-if="value"
                             badge-type="solid-outline"
                             :style-type="ROLE_TYPE_BADGE_OPTION[value].styleType"
                    >
                        {{ ROLE_TYPE_BADGE_OPTION[value] ? ROLE_TYPE_BADGE_OPTION[value].label : '' }}
                    </p-badge>
                </template>
                <template #col-assignTo-format="{ value }">
                    {{ state.users[value.resource_id] ? state.users[value.resource_id].label : '--' }}
                </template>
            </p-data-table>
        </template>
    </delete-modal>
</template>
