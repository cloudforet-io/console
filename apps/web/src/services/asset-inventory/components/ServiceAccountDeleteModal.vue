<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PButtonModal, PDataTable, PDoubleCheckModal,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import type { ServiceAccountDeleteParameters } from '@/schema/identity/service-account/api-verbs/detele';
import type { ServiceAccountModel } from '@/schema/identity/service-account/model';
import type { AccountType } from '@/schema/identity/service-account/type';
import type { TrustedAccountDeleteParameters } from '@/schema/identity/trusted-account/api-verbs/detele';
import type { TrustedAccountModel } from '@/schema/identity/trusted-account/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';


const props = withDefaults(defineProps<{
    visible: boolean;
    serviceAccountType: AccountType;
    serviceAccountData: Partial<ServiceAccountModel>|Partial<TrustedAccountModel>|undefined;
    attachedGeneralAccounts: ServiceAccountModel[];

}>(), {
    visible: false,
    serviceAccountType: 'GENERAL',
    serviceAccountData: undefined,
});

const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;}>();


const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    fields: [
        { label: 'Service Account Name', name: 'name' },
    ],
    isGeneralAccount: computed(() => props.serviceAccountType === 'GENERAL'),
});

/* Api */
const deleteServiceAccount = async () => {
    try {
        if (state.isGeneralAccount && ('service_account_id' in props.serviceAccountData)) {
            await SpaceConnector.clientV2.identity.serviceAccount.delete<ServiceAccountDeleteParameters>({
                service_account_id: props.serviceAccountData?.service_account_id ?? '',
            });
        } else {
            await SpaceConnector.clientV2.identity.trustedAccount.delete<TrustedAccountDeleteParameters>({
                trusted_account_id: props.serviceAccountData?.trusted_account_id ?? '',
            });
        }
        showSuccessMessage(i18n.t('IDENTITY.SERVICE_ACCOUNT.MAIN.ALT_S_DELETE_ACCOUNT'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.SERVICE_ACCOUNT.MAIN.ALT_E_DELETE_ACCOUNT'));
    } finally {
        state.proxyVisible = false;
    }
};

/* Event */
const handleConfirmDelete = async () => {
    await deleteServiceAccount();
    await SpaceRouter.router.push({ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME, query: { provider: props.providerId } });
};
</script>

<template>
    <div class="service-account-delete-modal">
        <p-double-check-modal v-if="state.proxyVisible && !props.attachedGeneralAccounts.length"
                              :visible.sync="state.proxyVisible"
                              :header-title="$t('IDENTITY.SERVICE_ACCOUNT.MAIN.CHECK_MODAL_DELETE_TITLE')"
                              :verification-text="props.serviceAccountData?.name ?? ''"
                              modal-size="sm"
                              @confirm="handleConfirmDelete"
        />
        <p-button-modal v-if="state.proxyVisible && !!props.attachedGeneralAccounts.length"
                        :visible.sync="state.proxyVisible"
                        :header-title="$t('INVENTORY.SERVICE_ACCOUNT.DELETE_CHECK_MODAL.TITLE')"
                        theme-color="alert"
                        :hide-header-close-button="true"
                        :hide-footer-confirm-button="true"
        >
            <template #body>
                <span class="help-text">{{ $t('INVENTORY.SERVICE_ACCOUNT.DELETE_CHECK_MODAL.NOTE') }}</span>
                <p-data-table :fields="state.fields"
                              :items="props.attachedGeneralAccounts"
                              :sortable="false"
                              :selectable="false"
                />
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
}
</style>
