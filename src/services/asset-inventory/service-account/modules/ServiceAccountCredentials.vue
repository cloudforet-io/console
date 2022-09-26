<template>
    <p-pane-layout class="service-account-credentials">
        <p-panel-top :title="$t('IDENTITY.SERVICE_ACCOUNT.MAIN.TAB_CREDENTIALS')">
            <template #extra>
                <p-button v-if="mode === 'READ'" icon="ic_edit"
                          style-type="transparent"
                          :disabled="!editable"
                          @click="handleClickEditButton"
                >
                    {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.EDIT') }}
                </p-button>
                <div v-else class="button-wrapper">
                    <p-button style-type="transparent" @click="handleClickCancelButton">
                        {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.CANCEL') }}
                    </p-button>
                    <p-button style-type="primary-dark"
                              :disabled="!isFormValid"
                              @click="handleClickSaveButton"
                    >
                        {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.SAVE') }}
                    </p-button>
                </div>
            </template>
        </p-panel-top>
        <div class="content-wrapper">
            <service-account-credentials-detail v-show="mode === 'READ'"
                                                :credential-data="credentialData"
            />
            <service-account-credentials-form v-if="mode === 'UPDATE'"
                                              edit-mode="UPDATE"
                                              :service-account-type="serviceAccountType"
                                              :provider="provider"
                                              :is-valid.sync="isFormValid"
                                              :origin-form-data="credentialForm"
                                              @change="handleChangeCredentialForm"
            />
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    defineComponent, reactive, toRefs, watch,
} from 'vue';

import {
    PPaneLayout, PPanelTop, PButton,
} from '@spaceone/design-system';
import { isEmpty } from 'lodash';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ACCOUNT_TYPE } from '@/services/asset-inventory/service-account/config';
import ServiceAccountCredentialsDetail
    from '@/services/asset-inventory/service-account/modules/ServiceAccountCredentialsDetail.vue';
import ServiceAccountCredentialsForm
    from '@/services/asset-inventory/service-account/modules/ServiceAccountCredentialsForm.vue';
import type {
    PageMode, CredentialForm, AccountType, CredentialModel,
} from '@/services/asset-inventory/service-account/type';


interface Props {
    provider?: string;
    serviceAccountId?: string;
    serviceAccountType: AccountType;
    serviceAccountName?: string;
    projectId?: string;
    editable: boolean;
}

export default defineComponent<Props>({
    name: 'ServiceAccountCredentials',
    components: {
        ServiceAccountCredentialsForm,
        ServiceAccountCredentialsDetail,
        PPaneLayout,
        PPanelTop,
        PButton,
    },
    props: {
        provider: {
            type: String,
            default: undefined,
        },
        serviceAccountId: {
            type: String,
            default: undefined,
        },
        serviceAccountType: {
            type: String as PropType<AccountType>,
            default: 'GENERAL',
        },
        serviceAccountName: {
            type: String,
            default: undefined,
        },
        projectId: {
            type: String,
            default: undefined,
        },
        editable: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const state = reactive({
            loading: true,
            mode: 'READ' as PageMode,
            isFormValid: undefined,
            credentialData: {} as CredentialModel,
            credentialForm: {} as CredentialForm,
        });

        /* Api */
        const apiQuery = new ApiQueryHelper();
        const getCredentialData = async (serviceAccountId: string) => {
            try {
                state.loading = true;

                const getQuery = () => apiQuery
                    .setFilters([{ k: 'service_account_id', v: serviceAccountId, o: '=' }]);
                let listApi = SpaceConnector.client.secret.secret.list;
                if (props.serviceAccountType === ACCOUNT_TYPE.TRUSTED) {
                    listApi = SpaceConnector.client.secret.trustedSecret.list;
                }
                const { results } = await listApi({ query: getQuery().data });
                if (results.length) {
                    state.credentialData = results[0];
                    state.credentialForm.selectedSecretType = results[0].schema;
                } else {
                    state.credentialData = {};
                }
            } catch (e) {
                ErrorHandler.handleError(e);
                state.credentialData = {};
            } finally {
                state.loading = false;
            }
        };
        const deleteGeneralSecret = async (): Promise<boolean> => {
            try {
                await SpaceConnector.client.secret.secret.delete({
                    secret_id: state.credentialData.secret_id,
                });
                return true;
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_E_UPDATE_CREDENTIALS'));
                return false;
            }
        };
        const createGeneralSecret = async () => {
            try {
                let data;
                if (state.credentialForm.activeDataType === 'json') {
                    data = JSON.parse(state.credentialForm.credentialJson);
                } else if (state.credentialForm.activeDataType === 'input') {
                    data = state.credentialForm;
                }

                await SpaceConnector.client.secret.secret.create({
                    name: (props.serviceAccountName ?? '') + props.serviceAccountId,
                    data,
                    schema: state.credentialForm.selectedSecretType,
                    secret_type: 'CREDENTIALS',
                    service_account_id: props.serviceAccountId,
                    project_id: props.projectId || null,
                });
                showSuccessMessage(i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_S_UPDATE_CREDENTIALS'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_E_UPDATE_CREDENTIALS'));
            }
        };
        const updateTrustedSecret = async (): Promise<boolean> => {
            try {
                await SpaceConnector.client.secret.trustedSecret.update({
                    trusted_secret_id: state.credentialData.trusted_secret_id,
                    schema: state.credentialForm.selectedSecretType,
                });
                return true;
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_E_UPDATE_CREDENTIALS'));
                return false;
            }
        };
        const updateDataTrustedSecret = async () => {
            try {
                let data;
                if (state.credentialForm.activeDataType === 'json') {
                    data = JSON.parse(state.credentialForm.credentialJson);
                } else if (state.credentialForm.activeDataType === 'input') {
                    data = state.credentialForm;
                }

                await SpaceConnector.client.secret.trustedSecret.updateData({
                    trusted_secret_id: state.credentialData.trusted_secret_id,
                    data,
                });

                showSuccessMessage(i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_S_UPDATE_CREDENTIALS'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_E_UPDATE_CREDENTIALS'));
            }
        };
        const updateServiceAccount = async () => {
            try {
                await SpaceConnector.client.identity.serviceAccount.update({
                    service_account_id: props.serviceAccountId,
                    trusted_service_account_id: state.credentialForm.attachedTrustedAccountId ?? '',
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        /* Event */
        const handleClickEditButton = () => {
            state.mode = 'UPDATE';
        };
        const handleClickCancelButton = () => {
            state.mode = 'READ';
        };
        const handleClickSaveButton = async () => {
            if (!state.isFormValid) return;
            // preprocessing data
            if (state.credentialForm.customSchemaForm?.private_key) {
                state.credentialForm.customSchemaForm.private_key = state.credentialForm.customSchemaForm.private_key.replace(/\\n/g, '\n');
            }
            if (props.serviceAccountType === ACCOUNT_TYPE.GENERAL) {
                let isValid = true;
                if (!isEmpty(state.credentialData)) isValid = await deleteGeneralSecret();
                if (isValid) {
                    await updateServiceAccount();
                    if (state.credentialForm.hasCredentialKey) {
                        await createGeneralSecret();
                    } else {
                        showSuccessMessage(i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_S_UPDATE_CREDENTIALS'), '');
                    }
                }
            } else {
                let isValid = true;
                if (state.credentialForm.selectedSecretType !== state.credentialData.schema) {
                    isValid = await updateTrustedSecret();
                }
                if (isValid) await updateDataTrustedSecret();
            }
            await getCredentialData(props.serviceAccountId as string);
            state.mode = 'READ';
        };
        const handleChangeCredentialForm = (credentialForm) => {
            state.credentialForm = credentialForm;
        };

        /* Watcher */
        watch([() => props.serviceAccountId, () => props.serviceAccountType], ([serviceAccountId]) => {
            if (serviceAccountId) getCredentialData(serviceAccountId);
        }, { immediate: true });

        return {
            ...toRefs(state),
            handleClickEditButton,
            handleClickCancelButton,
            handleClickSaveButton,
            handleChangeCredentialForm,
        };
    },
});
</script>
<style lang="postcss" scoped>
.service-account-credentials {
    /* custom design-system component - p-panel-top */
    :deep(.p-panel-top) {
        .extra {
            text-align: right;
        }
    }
    .content-wrapper {
        padding: 0.5rem 1rem 2.5rem 1rem;
    }
}
</style>
