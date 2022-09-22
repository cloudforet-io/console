<template>
    <p-pane-layout class="service-account-base-information">
        <p-panel-top :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.BASE_TITLE')">
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
            <p-data-loader :loading="loading">
                <service-account-base-information-detail v-show="mode === 'READ'"
                                                         :provider="provider"
                                                         :service-account-data="serviceAccountData"
                />
                <service-account-base-information-form v-if="mode === 'UPDATE'"
                                                       edit-mode="UPDATE"
                                                       :schema="baseInformationSchema"
                                                       :is-valid.sync="isFormValid"
                                                       :origin-form-data="baseInformationForm"
                                                       @change="handleChangeForm"
                />
            </p-data-loader>
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, reactive, toRefs, watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import {
    PButton, PDataLoader, PPaneLayout, PPanelTop,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ACCOUNT_TYPE } from '@/services/asset-inventory/service-account/config';
import ServiceAccountBaseInformationDetail
    from '@/services/asset-inventory/service-account/modules/ServiceAccountBaseInformationDetail.vue';
import ServiceAccountBaseInformationForm
    from '@/services/asset-inventory/service-account/modules/ServiceAccountBaseInformationForm.vue';
import type {
    BaseInformationForm, PageMode, ProviderModel, ServiceAccountModel,
    ServiceAccountModelForBinding,
} from '@/services/asset-inventory/service-account/type';
import { EDIT_MODE } from '@/services/asset-inventory/service-account/type';


export default {
    name: 'ServiceAccountBaseInformation',
    components: {
        PDataLoader,
        ServiceAccountBaseInformationForm,
        ServiceAccountBaseInformationDetail,
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
        editable: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const vm = getCurrentInstance()?.proxy as Vue;
        const state = reactive({
            loading: true,
            providerData: {} as ProviderModel,
            mode: 'READ' as PageMode,
            isFormValid: undefined,
            baseInformationSchema: computed(() => state.providerData.template?.service_account?.schema ?? null),
            serviceAccountData: {} as ServiceAccountModel,
            baseInformationForm: {} as BaseInformationForm,
        });

        /* Api */
        const getProvider = async () => {
            try {
                state.providerData = await SpaceConnector.client.identity.provider.get({
                    provider: props.provider,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
                state.providerData = {};
            }
        };

        // add TRUSTED MANAGED directly
        const serviceAccountPreprocessor = (serviceAccount: ServiceAccountModelForBinding): ServiceAccountModelForBinding => {
            if (serviceAccount.service_account_type === ACCOUNT_TYPE.TRUSTED && serviceAccount.tags?.is_managed) {
                return {
                    ...serviceAccount,
                    service_account_type: 'TRUSTED-MANAGED',
                };
            }
            return serviceAccount;
        };
        const getServiceAccount = async (serviceAccountId) => {
            try {
                state.loading = true;
                const result = await SpaceConnector.client.identity.serviceAccount.get({
                    service_account_id: serviceAccountId,
                });

                state.serviceAccountData = serviceAccountPreprocessor(result);
                state.baseInformationForm = {
                    accountName: result.name,
                    customSchemaForm: result.data,
                    tags: result.tags,
                };
            } catch (e) {
                ErrorHandler.handleError(e);
                state.serviceAccountData = {};
            } finally {
                state.loading = false;
            }
        };
        const updateServiceAccount = async () => {
            try {
                state.serviceAccountData = await SpaceConnector.client.identity.serviceAccount.update({
                    service_account_id: props.serviceAccountId,
                    name: state.baseInformationForm.accountName,
                    data: state.baseInformationForm.customSchemaForm,
                    tags: state.baseInformationForm.tags,
                });
                showSuccessMessage(i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_S_UPDATE_BASE_INFO'), '', vm.$root);
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_E_UPDATE_BASE_INFO'));
            }
        };

        /* Event */
        const handleClickEditButton = () => {
            state.mode = 'UPDATE';
        };
        const handleClickCancelButton = () => {
            state.mode = 'READ';
        };
        const handleClickSaveButton = () => {
            if (!state.isFormValid) return;
            updateServiceAccount();
            state.mode = 'READ';
        };
        const handleChangeForm = (form) => {
            state.baseInformationForm = form;
        };

        /* Watcher */
        watch(() => props.provider, (provider) => {
            if (provider) getProvider();
        });
        watch(() => props.serviceAccountId, (serviceAccountId) => {
            if (serviceAccountId) getServiceAccount(serviceAccountId);
        }, { immediate: true });

        return {
            ...toRefs(state),
            EDIT_MODE,
            handleClickEditButton,
            handleClickCancelButton,
            handleClickSaveButton,
            handleChangeForm,
        };
    },
};
</script>
<style lang="postcss" scoped>
.service-account-base-information {
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
