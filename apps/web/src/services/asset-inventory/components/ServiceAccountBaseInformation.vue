<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PButton, PPaneLayout, PHeading,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ProviderGetParameters } from '@/schema/identity/provider/api-verbs/get';
import type { ProviderModel } from '@/schema/identity/provider/model';
import type { ServiceAccountGetParameters } from '@/schema/identity/service-account/api-verbs/get';
import { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';
import type { ServiceAccountModel, ServiceAccountModelForBinding } from '@/schema/identity/service-account/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import ServiceAccountBaseInformationDetail
    from '@/services/asset-inventory/components/ServiceAccountBaseInformationDetail.vue';
import ServiceAccountBaseInformationForm
    from '@/services/asset-inventory/components/ServiceAccountBaseInformationForm.vue';
import type {
    BaseInformationForm, PageMode,
} from '@/services/asset-inventory/types/service-account-page-type';

interface Props {
    provider?: string;
    serviceAccountId?: string;
    editable: boolean;
    serviceAccountLoading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    provider: undefined,
    serviceAccountId: undefined,
    editable: false,
    serviceAccountLoading: false,
});

const emit = defineEmits<{(e: 'refresh'): void;
}>();

const state = reactive({
    loading: true,
    providerData: {} as ProviderModel,
    mode: 'READ' as PageMode,
    isFormValid: undefined,
    baseInformationSchema: computed(() => state.providerData.template?.service_account?.schema ?? null),
    serviceAccountData: undefined as ServiceAccountModel|undefined,
    baseInformationForm: {} as BaseInformationForm,
    originBaseInformationForm: {} as BaseInformationForm,
    domainId: computed(() => store.state.domain.domainId), // TODO: remove domain_id after backend is ready
});

/* Api */
const getProvider = async () => {
    try {
        state.providerData = await SpaceConnector.clientV2.identity.provider.get<ProviderGetParameters, ProviderModel>({
            domain_id: state.domainId, // TODO: remove domain_id after backend is ready
            provider: props.provider ?? '',
            workspace_id: undefined,
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
        const result = await SpaceConnector.clientV2.identity.serviceAccount.get<ServiceAccountGetParameters, ServiceAccountModel>({
            domain_id: state.domainId, // TODO: remove domain_id after backend is ready
            service_account_id: serviceAccountId,
            // workspace_id: ws-xxxxx   # TODO: add workspace_id after store is ready
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

</script>

<template>
    <p-pane-layout class="service-account-base-information">
        <p-heading heading-type="sub"
                   :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.BASE_TITLE')"
        >
            <template #extra>
                <p-button v-if="state.mode === 'READ' && props.editable"
                          icon-left="ic_edit"
                          style-type="transparent"
                          @click="handleClickEditButton"
                >
                    {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.EDIT') }}
                </p-button>
                <div v-if="state.mode === 'UPDATE'"
                     class="button-wrapper"
                >
                    <p-button style-type="transparent"
                              @click="handleClickCancelButton"
                    >
                        {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.CANCEL') }}
                    </p-button>
                    <p-button style-type="primary"
                              :disabled="!state.isFormValid"
                              @click="handleClickSaveButton"
                    >
                        {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.SAVE') }}
                    </p-button>
                </div>
            </template>
        </p-heading>
        <div class="content-wrapper">
            <service-account-base-information-detail v-show="state.mode === 'READ'"
                                                     :provider="props.provider"
                                                     :service-account-data="state.serviceAccountData"
                                                     :loading="props.serviceAccountLoading || state.loading"
            />
            <service-account-base-information-form v-if="state.mode === 'UPDATE'"
                                                   edit-mode="UPDATE"
                                                   :schema="state.baseInformationSchema"
                                                   :is-valid.sync="state.isFormValid"
                                                   :origin-form="state.originBaseInformationForm"
                                                   @change="handleChangeForm"
            />
        </div>
    </p-pane-layout>
</template>

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
