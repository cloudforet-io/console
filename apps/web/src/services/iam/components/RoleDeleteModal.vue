<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PDataTable } from '@cloudforet/mirinae';
import { iso8601Formatter } from '@cloudforet/utils';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { RoleBindingListParameters } from '@/api-clients/identity/role-binding/schema/api-verbs/list';
import type { RoleBindingModel } from '@/api-clients/identity/role-binding/schema/model';
import type { RoleDeleteParameters } from '@/api-clients/identity/role/schema/api-verbs/delete';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useRoleFormatter } from '@/services/iam/composables/refined-table-data';
import {
    ROLE_MODAL_TABLE_FIELDS,
    ROLE_UN_DELETABLE_TABLE_FIELDS,
} from '@/services/iam/constants/role-constant';
import { useRolePageStore } from '@/services/iam/store/role-page-store';

interface UnDeletableRole {
    roleName: string;
    roleId: string;
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

const allReferenceStore = useAllReferenceStore();
const userStore = useUserStore();
const storeState = reactive({
    timezone: computed<string>(() => userStore.state.timezone ?? 'UTC'),
});
const state = reactive({
    users: computed<UserReferenceMap>(() => allReferenceStore.getters.user),
    loading: true,
    proxyVisible: useProxyValue('visible', props, emit),
    unDeletableRoles: [] as UnDeletableRole[],
    isDeletable: computed(() => state.unDeletableRoles.length === 0),
    headerTitle: computed(() => (state.isDeletable ? i18n.t('IAM.ROLE.MODAL.DELETE_TITLE') : i18n.t('IAM.ROLE.MODAL.DELETE_TITLE_CANNOT'))),
});

/* API */
const getRoleBindingList = () => Promise.all(rolePageStore.selectedRoles.map(async (role) => {
    state.loading = true;
    try {
        const response = await SpaceConnector.clientV2.identity.roleBinding.list<RoleBindingListParameters, ListResponse<RoleBindingModel>>({
            role_id: role.role_id,
        });
        const results = response.results || [];
        const roleBindingList: UnDeletableRole[] = results?.map((roleBinding: RoleBindingModel) => ({
            roleName: role.name,
            roleId: role.role_id,
            roleType: role.role_type,
            assignTo: { resource_id: roleBinding.user_id, resource_type: 'identity.User' },
        })) ?? [];
        state.unDeletableRoles = state.unDeletableRoles.concat(roleBindingList);
    } catch (e) {
        ErrorHandler.handleError(e);
        state.unDeletableRoles = [];
    } finally {
        state.loading = false;
    }
}));
const handleDelete = async () => {
    let isAllSucceed = true;
    await Promise.all(rolePageStore.selectedRoles.map(async (role) => {
        try {
            await SpaceConnector.clientV2.identity.role.delete<RoleDeleteParameters>({ role_id: role.role_id });
        } catch (e: any) {
            isAllSucceed = false;
            ErrorHandler.handleRequestError(e, i18n.t('IAM.ROLE.ALT_E_DELETE_ROLE'));
        }
    }));
    if (isAllSucceed) {
        showSuccessMessage(i18n.t('IAM.ROLE.ALT_S_DELETE_ROLE'), '');
        state.proxyVisible = false;
        emit('refresh');
    }
};

/* Watcher */
watch(() => state.proxyVisible, async (after) => {
    if (after) {
        state.unDeletableRoles = [];
        await getRoleBindingList();
    }
}, { immediate: true });
</script>

<template>
    <delete-modal v-if="state.proxyVisible && !state.loading"
                  :visible.sync="state.proxyVisible"
                  size="md"
                  :header-title="state.headerTitle"
                  :hide-footer="!state.isDeletable"
                  :loading="state.loading"
                  :enable-scroll="true"
                  class="role-delete-modal"
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
                          :fields="ROLE_MODAL_TABLE_FIELDS"
                          :loading="state.loading"
                          :table-custom-style="{ maxHeight: 'calc(100vh - 17.5rem)' }"
            >
                <template #col-role_type-format="{ value }">
                    <span class="role-type">
                        <img :src="useRoleFormatter(value).image"
                             alt="role-type-icon"
                             class="role-type-icon"
                        >
                        <span>{{ useRoleFormatter(value).name }}</span>
                    </span>
                </template>
                <template #col-created_at-format="{ value }">
                    {{ iso8601Formatter(value, storeState.timezone) }}
                </template>
            </p-data-table>
            <p-data-table v-else
                          :items="state.unDeletableRoles"
                          :fields="ROLE_UN_DELETABLE_TABLE_FIELDS"
                          :loading="state.loading"
                          :table-custom-style="{ maxHeight: 'calc(100vh - 19.5rem)' }"
            >
                <template #col-roleType-format="{ value }">
                    <span class="role-type">
                        <img :src="useRoleFormatter(value).image"
                             alt="role-type-icon"
                             class="role-type-icon"
                        >
                        <span>{{ useRoleFormatter(value).name }}</span>
                    </span>
                </template>
                <template #col-assignTo-format="{ value }">
                    {{ state.users[value.resource_id] ? state.users[value.resource_id].label : '--' }}
                </template>
            </p-data-table>
        </template>
    </delete-modal>
</template>

<style scoped lang="postcss">
.role-delete-modal {
    .role-type {
        @apply flex items-center;
        gap: 0.5rem;
        .role-type-icon {
            @apply rounded-full;
            width: 1.5rem;
            height: 1.5rem;
        }
    }
}
</style>
