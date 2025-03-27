<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal, PDoubleCheckModal, PLink } from '@cloudforet/mirinae';

import type { ServiceAccountDeleteParameters } from '@/api-clients/identity/service-account/schema/api-verbs/detele';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';
import type { AccountType } from '@/api-clients/identity/service-account/schema/type';
import type { TrustedAccountDeleteParameters } from '@/api-clients/identity/trusted-account/schema/api-verbs/detele';
import type { TrustedAccountModel } from '@/api-clients/identity/trusted-account/schema/model';
import { i18n as _i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import { useRecentStore } from '@/common/modules/navigations/stores/recent-store';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

import { ADMIN_SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/admin/route-constant';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';
import { useServiceAccountPageStore } from '@/services/service-account/stores/service-account-page-store';

interface Props {
    visible: boolean;
    serviceAccountType: AccountType;
    serviceAccountData: Partial<ServiceAccountModel>|Partial<TrustedAccountModel>|undefined;
    attachedGeneralAccounts: ServiceAccountModel[];
    isAgentMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    serviceAccountType: 'GENERAL',
    serviceAccountData: undefined,
});

const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;}>();
const serviceAccountPageStore = useServiceAccountPageStore();
const allReferenceStore = useAllReferenceStore();
const appContextStore = useAppContextStore();
const recentStore = useRecentStore();
const router = useRouter();
const state = reactive({
    trustedAccounts: computed(() => allReferenceStore.getters.trustedAccount),
    proxyVisible: useProxyValue('visible', props, emit),
    fields: [
        { label: 'Service Account Name', name: 'name' },
        { label: 'Service Account ID', name: 'service_account_id' },
    ],
    isGeneralAccount: computed(() => props.serviceAccountType === 'GENERAL'),
    serviceAccountData: computed(() => serviceAccountPageStore.state.originServiceAccountItem),
    relatedTrustedAccount: computed(() => state.trustedAccounts[state.serviceAccountData?.trusted_account_id]?.data ?? {}),
    isSyncedAccount: computed(() => state.serviceAccountData.is_managed && state.relatedTrustedAccount?.schedule?.state === 'ENABLED'),
    accountDeleteWarningInAgentMode: computed(() => _i18n.t('INVENTORY.SERVICE_ACCOUNT.AGENT.DELETE_WARNING')),
});

/* Api */
const deleteServiceAccount = async () => {
    try {
        if (state.isGeneralAccount && props.serviceAccountData && ('service_account_id' in props.serviceAccountData)) {
            await SpaceConnector.clientV2.identity.serviceAccount.delete<ServiceAccountDeleteParameters>({
                service_account_id: props.serviceAccountData?.service_account_id ?? '',
            });
            await recentStore.deleteRecent({
                type: RECENT_TYPE.SERVICE_ACCOUNT,
                itemId: props.serviceAccountData?.service_account_id ?? '',
            });
        } else {
            await SpaceConnector.clientV2.identity.trustedAccount.delete<TrustedAccountDeleteParameters>({
                trusted_account_id: props.serviceAccountData?.trusted_account_id ?? '',
            });
        }
        showSuccessMessage(_i18n.t('IDENTITY.SERVICE_ACCOUNT.MAIN.ALT_S_DELETE_ACCOUNT'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, _i18n.t('IDENTITY.SERVICE_ACCOUNT.MAIN.ALT_E_DELETE_ACCOUNT'));
    } finally {
        state.proxyVisible = false;
    }
};

/* Event */
const handleConfirmDelete = async () => {
    await deleteServiceAccount();
    await router.push({
        name: appContextStore.getters.isAdminMode ? ADMIN_SERVICE_ACCOUNT_ROUTE._NAME : SERVICE_ACCOUNT_ROUTE._NAME,
        query: { provider: serviceAccountPageStore.state.selectedProvider },
    }).catch(() => {});
};
</script>

<template>
    <div class="service-account-delete-modal">
        <p-double-check-modal v-if="state.proxyVisible && !props.attachedGeneralAccounts.length && !state.isSyncedAccount"
                              :visible.sync="state.proxyVisible"
                              :header-title="$t('IDENTITY.SERVICE_ACCOUNT.MAIN.CHECK_MODAL_DELETE_TITLE')"
                              :verification-text="props.serviceAccountData?.name ?? ''"
                              modal-size="sm"
                              @confirm="handleConfirmDelete"
        >
            <template v-if="props.isAgentMode"
                      #middle-contents
            >
                <div class="warning-wrapper">
                    <span>{{ state.accountDeleteWarningInAgentMode }}</span>
                </div>
            </template>
        </p-double-check-modal>
        <p-button-modal v-if="state.proxyVisible && !!props.attachedGeneralAccounts.length"
                        :visible.sync="state.proxyVisible"
                        :header-title="$t('INVENTORY.SERVICE_ACCOUNT.DELETE_CHECK_MODAL.TITLE')"
                        theme-color="alert"
                        size="sm"
                        :hide-footer-close-button="true"
                        @confirm="() => state.proxyVisible = false"
        >
            <template #confirm-button>
                {{ $t('APP.MAIN.OK') }}
            </template>
        </p-button-modal>
        <p-button-modal v-else-if="state.proxyVisible && state.isSyncedAccount"
                        :visible.sync="state.proxyVisible"
                        :header-title="$t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.DELETE_CHECK_MODAL.TITLE')"
                        theme-color="alert"
                        size="sm"
                        :hide-footer-close-button="true"
                        @confirm="() => state.proxyVisible = false"
        >
            <template #body>
                <i18n path="IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.DELETE_CHECK_MODAL.DESC"
                      tag="p"
                >
                    <template #serviceAccountName>
                        <p-link new-tab
                                highlight
                                action-icon="external-link"
                                :to="{ name: SERVICE_ACCOUNT_ROUTE.DETAIL._NAME, params: { serviceAccountId: state.relatedTrustedAccount.trusted_account_id }}"
                        >
                            {{ state.relatedTrustedAccount.name }}
                        </p-link>
                    </template>
                </i18n>
            </template>
            <template #confirm-button>
                {{ $t('APP.MAIN.OK') }}
            </template>
        </p-button-modal>
    </div>
</template>

<style lang="postcss" scoped>
.service-account-delete-modal {
    /* custom design-system component - p-button-modal */
    :deep(.p-button-modal) {
        .help-text {
            display: block;
            margin-bottom: 1rem;
        }
    }
    .warning-wrapper {
        @apply bg-yellow-100 rounded text-label-lg font-bold text-yellow-700;
        width: 100%;
        height: 3.75rem;
        padding: 0.625rem 1rem;
        margin-bottom: 1rem;
    }
}
</style>
