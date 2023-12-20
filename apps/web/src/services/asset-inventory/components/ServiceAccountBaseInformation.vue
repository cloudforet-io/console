<script setup lang="ts">
import type { ComputedRef } from 'vue';
import { computed, reactive, watch } from 'vue';

import {
    PButton, PPaneLayout, PHeading,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ProviderGetParameters } from '@/schema/identity/provider/api-verbs/get';
import type { ProviderModel } from '@/schema/identity/provider/model';
import type { SchemaGetParameters } from '@/schema/identity/schema/api-verbs/get';
import type { SchemaModel } from '@/schema/identity/schema/model';
import type { ServiceAccountUpdateParameters } from '@/schema/identity/service-account/api-verbs/update';
import { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';
import type { ServiceAccountModel } from '@/schema/identity/service-account/model';
import type { AccountType } from '@/schema/identity/service-account/type';
import type { TrustedAccountUpdateParameters } from '@/schema/identity/trusted-account/api-verbs/update';
import type { TrustedAccountModel } from '@/schema/identity/trusted-account/model';
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
    serviceAccountData: Partial<ServiceAccountModel>|Partial<TrustedAccountModel>|undefined;
}

const props = withDefaults(defineProps<Props>(), {
    provider: undefined,
    serviceAccountId: undefined,
    editable: false,
    serviceAccountLoading: false,
    serviceAccountType: ACCOUNT_TYPE.GENERAL,
    serviceAccountData: undefined,
});

const emit = defineEmits<{(e: 'refresh'): void; }>();

interface State {
    loading: boolean;
    isTrustedAccount: ComputedRef<boolean>;
    providerData: Partial<ProviderModel>;
    mode: PageMode;
    isFormValid: boolean|undefined;
    baseInformationSchema: Partial<SchemaModel>;
    baseInformationForm: Partial<BaseInformationForm>;
    originBaseInformationForm: ComputedRef<Partial<BaseInformationForm>>;
}
const state = reactive<State>({
    loading: false,
    isTrustedAccount: computed(() => props.serviceAccountType === ACCOUNT_TYPE.TRUSTED),
    providerData: {},
    mode: 'READ',
    isFormValid: undefined,
    baseInformationSchema: {},
    baseInformationForm: {},
    originBaseInformationForm: computed(() => ({
        accountName: props.serviceAccountData?.name,
        customSchemaForm: props.serviceAccountData?.data,
        tags: props.serviceAccountData?.tags,
        ...((state.isTrustedAccount && ('project_id' in props.serviceAccountData)) && {
            selectedProjectId: props.serviceAccountData?.project_id ?? '',
        }),
        projectForm: { selectedProjectId: props.serviceAccountData?.project_id ?? '' },
    })),
});

/* Api */
const getProvider = async () => {
    try {
        state.providerData = await SpaceConnector.clientV2.identity.provider.get<ProviderGetParameters, ProviderModel>({
            provider: props.provider ?? '',
            workspace_id: undefined,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        state.providerData = {};
    }
};
const updateServiceAccount = async () => {
    try {
        state.loading = true;
        if (state.isTrustedAccount) {
            await SpaceConnector.clientV2.identity.trustedAccount.update<TrustedAccountUpdateParameters, TrustedAccountModel>({
                trusted_account_id: props.serviceAccountId,
                name: state.baseInformationForm.accountName,
                data: state.baseInformationForm.customSchemaForm,
                tags: state.baseInformationForm.tags,
            });
        } else {
            await SpaceConnector.clientV2.identity.serviceAccount.update<ServiceAccountUpdateParameters, ServiceAccountModel>({
                service_account_id: props.serviceAccountId,
                name: state.baseInformationForm.accountName,
                data: state.baseInformationForm.customSchemaForm,
                tags: state.baseInformationForm.tags,
                project_id: state.baseInformationForm?.projectForm?.selectedProjectId,
            });
        }
        showSuccessMessage(i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_S_UPDATE_BASE_INFO'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_E_UPDATE_BASE_INFO'));
    } finally {
        state.loading = false;
    }
};

const getBaseInformationSchema = async () => {
    try {
        state.baseInformationSchema = await SpaceConnector.clientV2.identity.schema.get<SchemaGetParameters, SchemaModel>({
            schema_id: `${props.provider}-service-account`,
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
                                                     :service-account-data="props.serviceAccountData"
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
