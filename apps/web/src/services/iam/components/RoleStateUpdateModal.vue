<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import {
    PButtonModal, PDataTable, PStatus,
} from '@cloudforet/mirinae';
import { iso8601Formatter } from '@cloudforet/utils';

import { useRoleApi } from '@/api-clients/identity/role/composables/use-role-api';
import { ROLE_STATE } from '@/api-clients/identity/role/constant';
import type { RoleState } from '@/api-clients/identity/role/type';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useRoleFormatter, userStateFormatter } from '@/services/iam/composables/refined-table-data';
import { useRoleListQuery } from '@/services/iam/composables/use-role-list-query';
import { ROLE_MODAL_TABLE_FIELDS } from '@/services/iam/constants/role-constant';
import { useRolePageStore } from '@/services/iam/store/role-page-store';


type ModalStyleType = {
    title: TranslateResult;
    theme: 'primary' | 'alert';
};

interface Props {
    visible?: boolean;
    state?: RoleState;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    state: undefined,
});

const userStore = useUserStore();
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

const storeState = reactive({
    timezone: computed<string>(() => userStore.state.timezone ?? 'UTC'),
});
const state = reactive({
    loading: false,
    modalStyle: computed<ModalStyleType>(() => {
        if (props.state === ROLE_STATE.ENABLED) {
            return {
                title: i18n.t('IAM.ROLE.MODAL.ENABLE_TITLE'),
                theme: 'primary',
            };
        }
        return {
            title: i18n.t('IAM.ROLE.MODAL.DISABLE_TITLE'),
            theme: 'alert',
        };
    }),
    proxyVisible: useProxyValue('visible', props, emit),
});

const { roleAPI } = useRoleApi();
const queryClient = useQueryClient();
const { key: roleListKey } = useServiceQueryKey('identity', 'role', 'list');

const { mutateAsync: enable, isPending: isEnablePending } = useMutation({
    mutationFn: async (roleIds: string[]) => {
        await Promise.all(roleIds.map((roleId) => roleAPI.enable({ role_id: roleId })));
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: roleListKey.value });
        showSuccessMessage(i18n.t('IAM.ROLE.ALT_S_UPDATE_ROLE'), '');
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

const { mutateAsync: disable, isPending: isDisablePending } = useMutation({
    mutationFn: async (roleIds: string[]) => {
        await Promise.all(roleIds.map((roleId) => roleAPI.disable({ role_id: roleId })));
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: roleListKey.value });
        showSuccessMessage(i18n.t('IAM.ROLE.ALT_S_UPDATE_ROLE'), '');
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

/* API */
const handleConfirm = async () => {
    if (props.state === ROLE_STATE.ENABLED) {
        await enable(selectedRoleIds.value);
    } else {
        await disable(selectedRoleIds.value);
    }
};
</script>

<template>
    <p-button-modal :visible.sync="state.proxyVisible"
                    :header-title="state.modalStyle.title"
                    :theme-color="state.modalStyle.theme"
                    :loading="isEnablePending || isDisablePending"
                    size="md"
                    :enable-scroll="true"
                    class="role-state-modal"
                    @confirm="handleConfirm"
    >
        <template #body>
            <p-data-table class="role-data-table"
                          :items="selectedRoles"
                          :fields="ROLE_MODAL_TABLE_FIELDS"
                          :loading="isEnablePending || isDisablePending"
                          :table-custom-style="{ maxHeight: 'calc(100vh - 17.5rem)' }"
            >
                <template #col-state-format="{value}">
                    <p-status v-bind="userStateFormatter(value)"
                              class="capitalize"
                    />
                </template>
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
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.role-state-modal {
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
