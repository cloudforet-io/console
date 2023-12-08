<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PButton, PPaneLayout, PHeading,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ProviderGetParameters } from '@/schema/identity/provider/api-verbs/get';
import type { ProviderModel } from '@/schema/identity/provider/model';
import type { SchemaGetParameters } from '@/schema/identity/schema/api-verbs/get';
import type { SchemaModel } from '@/schema/identity/schema/model';
import type { ServiceAccountGetParameters } from '@/schema/identity/service-account/api-verbs/get';
import type { ServiceAccountUpdateParameters } from '@/schema/identity/service-account/api-verbs/update';
import { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';
import type { ServiceAccountModel } from '@/schema/identity/service-account/model';
import type { AccountType } from '@/schema/identity/service-account/type';
import type { TrustedAccountGetParameters } from '@/schema/identity/trusted-account/api-verbs/get';
import type { TrustedAccountUpdateParameters } from '@/schema/identity/trusted-account/api-verbs/update';
import type { TrustedAccountModel } from '@/schema/identity/trusted-account/model';
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
    serviceAccountType: AccountType;
}

const props = withDefaults(defineProps<Props>(), {
    provider: undefined,
    serviceAccountId: undefined,
    editable: false,
    serviceAccountLoading: false,
    serviceAccountType: ACCOUNT_TYPE.GENERAL,
});

const emit = defineEmits<{(e: 'refresh'): void;
}>();

const state = reactive({
    loading: true,
    providerData: {} as Partial<ProviderModel>,
    mode: 'READ' as PageMode,
    isFormValid: undefined,
    baseInformationSchema: {} as Partial<SchemaModel>,
    serviceAccountData: undefined as ServiceAccountModel|TrustedAccountModel|undefined,
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
const getServiceAccount = async (serviceAccountId:string) => {
    try {
        state.loading = true;
        let res;
        if (props.serviceAccountType === ACCOUNT_TYPE.TRUSTED) {
            res = await SpaceConnector.clientV2.identity.trustedAccount.get<TrustedAccountGetParameters, TrustedAccountModel>({
                domain_id: state.domainId, // TODO: remove domain_id after backend is ready
                trusted_account_id: serviceAccountId,
                workspace_id: undefined,
            });
        } else {
            res = await SpaceConnector.clientV2.identity.serviceAccount.get<ServiceAccountGetParameters, ServiceAccountModel>({
                domain_id: state.domainId, // TODO: remove domain_id after backend is ready
                service_account_id: serviceAccountId,
            });
        }

        state.serviceAccountData = res;
        state.baseInformationForm = {
            accountName: res.name,
            customSchemaForm: res.data,
            tags: res.tags,
            projectForm: res.project_info ?? {
                project_id: '',
                project_name: '',
            },
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
        if (props.serviceAccountType === ACCOUNT_TYPE.TRUSTED) {
            state.serviceAccountData = await SpaceConnector.clientV2.identity.trustedAccount.update<TrustedAccountUpdateParameters, TrustedAccountModel>({
                domain_id: state.domainId, // TODO: remove domain_id after backend is ready
                trusted_account_id: props.serviceAccountId,
                name: state.baseInformationForm.accountName,
                data: state.baseInformationForm.customSchemaForm,
                tags: state.baseInformationForm.tags,
            });
        } else {
            state.serviceAccountData = await SpaceConnector.clientV2.identity.serviceAccount.update<ServiceAccountUpdateParameters, ServiceAccountModel>({
                domain_id: state.domainId, // TODO: remove domain_id after backend is ready
                service_account_id: props.serviceAccountId,
                name: state.baseInformationForm.accountName,
                data: state.baseInformationForm.customSchemaForm,
                tags: state.baseInformationForm.tags,
            });
        }

        showSuccessMessage(i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_S_UPDATE_BASE_INFO'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_E_UPDATE_BASE_INFO'));
    }
};

const getBaseInformationSchema = async () => {
    try {
        state.baseInformationSchema = await SpaceConnector.clientV2.identity.schema.get<SchemaGetParameters, SchemaModel>({
            schema_id: `${props.provider}-service-account`,
            domain_id: state.domainId, // TODO: remove domain_id after backend is ready
            workspace_id: undefined,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        state.baseInformationSchema = {};
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
watch(() => props.provider, async (provider) => {
    if (provider) {
        await getProvider();
        await getBaseInformationSchema();
    }
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
                                                     :service-account-type="props.serviceAccountType"
                                                     :loading="props.serviceAccountLoading || state.loading"
            />
            <service-account-base-information-form v-if="state.mode === 'UPDATE'"
                                                   :schema="state.baseInformationSchema.schema"
                                                   :is-valid.sync="state.isFormValid"
                                                   :origin-form="state.originBaseInformationForm"
                                                   :account-type="props.serviceAccountType"
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
