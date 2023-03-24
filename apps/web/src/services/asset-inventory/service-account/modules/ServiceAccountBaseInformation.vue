<template>
    <p-pane-layout class="service-account-base-information">
        <p-heading heading-type="sub"
                   :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.BASE_TITLE')"
        >
            <template #extra>
                <p-button v-if="mode === 'READ' && editable"
                          icon-left="ic_edit"
                          style-type="transparent"
                          @click="handleClickEditButton"
                >
                    {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.EDIT') }}
                </p-button>
                <div v-if="mode === 'UPDATE'"
                     class="button-wrapper"
                >
                    <p-button style-type="transparent"
                              @click="handleClickCancelButton"
                    >
                        {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.CANCEL') }}
                    </p-button>
                    <p-button style-type="primary"
                              :disabled="!isFormValid"
                              @click="handleClickSaveButton"
                    >
                        {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.SAVE') }}
                    </p-button>
                </div>
            </template>
        </p-heading>
        <div class="content-wrapper">
            <service-account-base-information-detail v-show="mode === 'READ'"
                                                     :provider="provider"
                                                     :service-account-data="serviceAccountData"
                                                     :loading="serviceAccountLoading || loading"
            />
            <service-account-base-information-form v-if="mode === 'UPDATE'"
                                                   edit-mode="UPDATE"
                                                   :schema="baseInformationSchema"
                                                   :is-valid.sync="isFormValid"
                                                   :origin-form="originBaseInformationForm"
                                                   @change="handleChangeForm"
            />
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import type { SetupContext } from 'vue';
import {
    computed, defineComponent, reactive, toRefs, watch,
} from 'vue';

import {
    PButton, PPaneLayout, PHeading,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

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

interface Props {
    provider?: string;
    serviceAccountId?: string;
    editable: boolean;
    serviceAccountLoading: boolean;
}

export default defineComponent<Props>({
    name: 'ServiceAccountBaseInformation',
    components: {
        ServiceAccountBaseInformationForm,
        ServiceAccountBaseInformationDetail,
        PPaneLayout,
        PHeading,
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
        serviceAccountLoading: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            loading: true,
            providerData: {} as ProviderModel,
            mode: 'READ' as PageMode,
            isFormValid: undefined,
            baseInformationSchema: computed(() => state.providerData.template?.service_account?.schema ?? null),
            serviceAccountData: undefined as ServiceAccountModel|undefined,
            baseInformationForm: {} as BaseInformationForm,
            originBaseInformationForm: {} as BaseInformationForm,
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
            if (serviceAccount.service_account_type === ACCOUNT_TYPE.TRUSTED && serviceAccount.tags?.is_managed === 'true') {
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
                state.originBaseInformationForm = cloneDeep(state.baseInformationForm);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.serviceAccountData = undefined;
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
                showSuccessMessage(i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_S_UPDATE_BASE_INFO'), '');
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
        const handleClickSaveButton = async () => {
            if (!state.isFormValid) return;
            await updateServiceAccount();
            await getServiceAccount(props.serviceAccountId);
            state.mode = 'READ';
            emit('refresh');
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
            handleClickEditButton,
            handleClickCancelButton,
            handleClickSaveButton,
            handleChangeForm,
        };
    },
});
</script>
<style lang="postcss" scoped>
.service-account-base-information {
    /* custom design-system component - p-heading */
    :deep(.p-heading) {
        .extra {
            text-align: right;
        }
    }
    .content-wrapper {
        padding-top: 0.5rem;
        padding-bottom: 2.5rem;
        .service-account-base-information-form {
            padding-left: 1rem;
            padding-right: 1rem;
        }
    }
}
</style>
