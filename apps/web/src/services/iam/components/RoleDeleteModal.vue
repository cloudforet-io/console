<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PDataTable } from '@cloudforet/mirinae';
import { iso8601Formatter } from '@cloudforet/utils';

import { useRoleApi } from '@/api-clients/identity/role/composables/use-role-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useRoleFormatter } from '@/services/iam/composables/refined-table-data';
import { useRoleBindingListQuery } from '@/services/iam/composables/use-role-binding-list-query';
import { useRoleListQuery } from '@/services/iam/composables/use-role-list-query';
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
const rolePageState = rolePageStore.$state;

const selectedRoleIds = computed<string[]>(() => rolePageState.selectedRoleIds);
const { roleListData: selectedRoles } = useRoleListQuery(
    computed(() => ({
        query: {
            filter: [{ k: 'role_id', v: selectedRoleIds.value, o: 'in' }],
        },
    })),
);


const emit = defineEmits<{(e: ':update:visible'): void,
    (e: 'refresh'): void,
}>();

const referenceMap = useAllReferenceDataModel();

const userStore = useUserStore();
const storeState = reactive({
    timezone: computed<string>(() => userStore.state.timezone ?? 'UTC'),
});
const state = reactive({
    loading: true,
    proxyVisible: useProxyValue('visible', props, emit),
    unDeletableRoles: computed<UnDeletableRole[]>(() => selectedRoles.value.map((role) => roleBindingList.value.map((roleBinding) => ({
        roleName: role.name,
        roleId: role.role_id,
        roleType: role.role_type,
        assignTo: { resource_id: roleBinding.user_id, resource_type: 'identity.User' },
    }))).flat()),
    isDeletable: computed(() => state.unDeletableRoles.length === 0),
    headerTitle: computed(() => (state.isDeletable ? i18n.t('IAM.ROLE.MODAL.DELETE_TITLE') : i18n.t('IAM.ROLE.MODAL.DELETE_TITLE_CANNOT'))),
});

const { roleAPI } = useRoleApi();

const queryClient = useQueryClient();
const { key: roleListKey } = useServiceQueryKey('identity', 'role', 'list');
const { key: roleBindingListKey } = useServiceQueryKey('identity', 'role-binding', 'list');

const { roleBindingListData: roleBindingList, roleBindingListIsLoading } = useRoleBindingListQuery(
    computed(() => ({
        query: {
            filter: [{ k: 'role_id', v: selectedRoleIds.value, o: 'in' }],
        },
    })),
);


const { mutateAsync: deleteRole } = useMutation({
    mutationFn: roleAPI.delete,
    onSuccess: () => {
        showSuccessMessage(i18n.t('IAM.ROLE.ALT_S_DELETE_ROLE'), '');
        queryClient.invalidateQueries({ queryKey: roleListKey });
        queryClient.invalidateQueries({ queryKey: roleBindingListKey });
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, error.message);
    },
    onSettled: () => {
        rolePageStore.setSelectedRoleIds([]);
        rolePageStore.setSelectedIndices([]);
        state.proxyVisible = false;
        emit('refresh');
    },
});

const handleDelete = async () => {
    await Promise.allSettled(selectedRoleIds.value.map((roleId) => deleteRole({ role_id: roleId })));
};
</script>

<template>
    <delete-modal v-if="state.proxyVisible && !roleBindingListIsLoading"
                  :visible.sync="state.proxyVisible"
                  size="md"
                  :header-title="state.headerTitle"
                  :hide-footer="!state.isDeletable"
                  :loading="roleBindingListIsLoading"
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
                          :items="selectedRoles"
                          :fields="ROLE_MODAL_TABLE_FIELDS"
                          :loading="roleBindingListIsLoading"
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
                          :loading="roleBindingListIsLoading"
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
                    {{ referenceMap.user[value.resource_id]?.label || value.resource_id || '--' }}
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
