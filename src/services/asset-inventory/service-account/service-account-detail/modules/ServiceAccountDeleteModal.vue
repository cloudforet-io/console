<template>
    <div class="service-account-delete-modal">
        <p-double-check-modal v-if="proxyVisible && !attachedGeneralAccounts.length"
                              :visible.sync="proxyVisible"
                              :header-title="$t('IDENTITY.SERVICE_ACCOUNT.MAIN.CHECK_MODAL_DELETE_TITLE')"
                              :verification-text="serviceAccountName"
                              modal-size="sm"
                              @confirm="handleConfirmDelete"
        />
        <p-button-modal v-if="proxyVisible && !!attachedGeneralAccounts.length"
                        :visible.sync="proxyVisible"
                        :header-title="$t('INVENTORY.SERVICE_ACCOUNT.DELETE_CHECK_MODAL.TITLE')"
                        theme-color="alert"
                        :hide-header-close-button="true"
                        :hide-footer-confirm-button="true"
        >
            <template #body>
                <span class="help-text">{{ $t('INVENTORY.SERVICE_ACCOUNT.DELETE_CHECK_MODAL.NOTE') }}</span>
                <p-data-table :fields="fields"
                              :items="attachedGeneralAccounts"
                              :sortable="false"
                              :selectable="false"
                />
            </template>
        </p-button-modal>
    </div>
</template>

<script lang="ts">
import type { SetupContext, PropType } from 'vue';
import { reactive, toRefs } from 'vue';

import {
    PButtonModal, PDataTable, PDoubleCheckModal,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import type { ServiceAccountModel } from '@/services/asset-inventory/service-account/type';

export default {
    name: 'ServiceAccountDeleteModal',
    components: {
        PDoubleCheckModal,
        PButtonModal,
        PDataTable,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        serviceAccountId: {
            type: String,
            default: undefined,
        },
        serviceAccountName: {
            type: String,
            default: '',
        },
        attachedGeneralAccounts: {
            type: Array as PropType<ServiceAccountModel[]>,
            default: () => ([]),
        },
        providerId: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit }: SetupContext) {
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

        return {
            ...toRefs(state),
            handleConfirmDelete,
        };
    },
};
</script>

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
