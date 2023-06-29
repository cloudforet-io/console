<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PDataTable, PDoubleCheckModal,
} from '@spaceone/design-system';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import type { ServiceAccountModel } from '@/services/asset-inventory/service-account/type';

interface Props {
    visible?: boolean;
    serviceAccountId?: string;
    serviceAccountName?: string;
    attachedGeneralAccounts?: ServiceAccountModel[];
    providerId?: string;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    serviceAccountId: undefined,
    serviceAccountName: '',
    attachedGeneralAccounts: () => [],
    providerId: '',
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>();
const { t } = useI18n();
const router = useRouter();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    fields: [
        { label: 'Service Account Name', name: 'name' },
    ],
});

/* Api */
const deleteServiceAccount = async () => {
    try {
        await SpaceConnector.client.identity.serviceAccount.delete({
            service_account_id: props.serviceAccountId,
        });
        showSuccessMessage(t('IDENTITY.SERVICE_ACCOUNT.MAIN.ALT_S_DELETE_ACCOUNT'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('IDENTITY.SERVICE_ACCOUNT.MAIN.ALT_E_DELETE_ACCOUNT'));
    } finally {
        state.proxyVisible = false;
    }
};

/* Event */
const handleConfirmDelete = async () => {
    await deleteServiceAccount();
    await router.push({ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME, query: { provider: props.providerId } });
};

</script>

<template>
    <div class="service-account-delete-modal">
        <p-double-check-modal v-if="state.proxyVisible && !attachedGeneralAccounts.length"
                              v-model:visible="state.proxyVisible"
                              :header-title="t('IDENTITY.SERVICE_ACCOUNT.MAIN.CHECK_MODAL_DELETE_TITLE')"
                              :verification-text="serviceAccountName"
                              modal-size="sm"
                              @confirm="handleConfirmDelete"
        />
        <p-button-modal v-if="state.proxyVisible && !!attachedGeneralAccounts.length"
                        v-model:visible="state.proxyVisible"
                        :header-title="t('INVENTORY.SERVICE_ACCOUNT.DELETE_CHECK_MODAL.TITLE')"
                        theme-color="alert"
                        :hide-header-close-button="true"
                        :hide-footer-confirm-button="true"
        >
            <template #body>
                <span class="help-text">{{ t('INVENTORY.SERVICE_ACCOUNT.DELETE_CHECK_MODAL.NOTE') }}</span>
                <p-data-table :fields="state.fields"
                              :items="attachedGeneralAccounts"
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
