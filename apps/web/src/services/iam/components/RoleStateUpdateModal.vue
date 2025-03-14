<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PDataTable, PStatus,
} from '@cloudforet/mirinae';
import { iso8601Formatter } from '@cloudforet/utils';

import { ROLE_STATE } from '@/api-clients/identity/role/constant';
import type { RoleDisableParameters } from '@/api-clients/identity/role/schema/api-verbs/disable';
import type { RoleEnableParameters } from '@/api-clients/identity/role/schema/api-verbs/enable';
import type { RoleState } from '@/api-clients/identity/role/type';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useRoleFormatter, userStateFormatter } from '@/services/iam/composables/refined-table-data';
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

/* API */
const handleConfirm = async () => {
    let isAllSucceed = true;
    await Promise.all(rolePageStore.selectedRoles.map(async (role) => {
        state.loading = true;
        try {
            if (props.state === ROLE_STATE.ENABLED) {
                await SpaceConnector.clientV2.identity.role.enable<RoleEnableParameters>({ role_id: role.role_id });
            } else {
                await SpaceConnector.clientV2.identity.role.disable<RoleDisableParameters>({ role_id: role.role_id });
            }
        } catch (e: any) {
            isAllSucceed = false;
            ErrorHandler.handleRequestError(e, e.message);
        } finally {
            state.loading = false;
        }
    }));
    if (isAllSucceed) {
        showSuccessMessage(i18n.t('IAM.ROLE.ALT_S_UPDATE_ROLE'), '');
        state.proxyVisible = false;
        emit('refresh');
    }
};
</script>

<template>
    <p-button-modal :visible.sync="state.proxyVisible"
                    :header-title="state.modalStyle.title"
                    :theme-color="state.modalStyle.theme"
                    :loading="state.loading"
                    size="md"
                    :enable-scroll="true"
                    class="role-state-modal"
                    @confirm="handleConfirm"
    >
        <template #body>
            <p-data-table class="role-data-table"
                          :items="rolePageStore.selectedRoles"
                          :fields="ROLE_MODAL_TABLE_FIELDS"
                          :loading="state.loading"
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
