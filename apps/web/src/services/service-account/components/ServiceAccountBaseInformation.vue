<script setup lang="ts">
import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PPaneLayout, PHeading, PHeadingLayout,
} from '@cloudforet/mirinae';


import type { SchemaModel } from '@/api-clients/identity/schema/schema/model';
import type { ServiceAccountUpdateParameters } from '@/api-clients/identity/service-account/schema/api-verbs/update';
import { ACCOUNT_TYPE } from '@/api-clients/identity/service-account/schema/constant';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';
import type { TrustedAccountUpdateParameters } from '@/api-clients/identity/trusted-account/schema/api-verbs/update';
import type { TrustedAccountModel } from '@/api-clients/identity/trusted-account/schema/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import ServiceAccountBaseInformationDetail
    from '@/services/service-account/components/ServiceAccountBaseInformationDetail.vue';
import ServiceAccountBaseInformationForm
    from '@/services/service-account/components/ServiceAccountBaseInformationForm.vue';
import { useServiceAccountPageStore } from '@/services/service-account/stores/service-account-page-store';
import { useServiceAccountSchemaStore } from '@/services/service-account/stores/service-account-schema-store';
import type {
    BaseInformationForm, PageMode,
} from '@/services/service-account/types/service-account-page-type';

interface Props {
    serviceAccountId?: string;
    editable: boolean;
    serviceAccountLoading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    serviceAccountId: undefined,
    editable: false,
    serviceAccountLoading: false,
});

const emit = defineEmits<{(e: 'refresh'): void; }>();
const serviceAccountSchemaStore = useServiceAccountSchemaStore();
const serviceAccountPageStore = useServiceAccountPageStore();

interface State {
    loading: boolean;
    isTrustedAccount: ComputedRef<boolean>;
    mode: PageMode;
    isFormValid: ComputedRef<boolean|undefined>;
    baseInformationSchema: ComputedRef<Partial<SchemaModel>>;
    baseInformationForm: ComputedRef<Partial<BaseInformationForm>>;
}
const state = reactive<State>({
    loading: false,
    isTrustedAccount: computed(() => serviceAccountPageStore.state.serviceAccountType === ACCOUNT_TYPE.TRUSTED),
    mode: 'READ',
    isFormValid: computed(() => serviceAccountPageStore.formState.isBaseInformationFormValid),
    // baseInformationSchema: {},
    baseInformationSchema: computed(() => (state.isTrustedAccount ? serviceAccountSchemaStore.getters.trustedAccountSchema : serviceAccountSchemaStore.getters.generalAccountSchema)),
    baseInformationForm: computed(() => serviceAccountPageStore.formState.baseInformation),
});

/* Api */

const updateServiceAccount = async () => {
    try {
        state.loading = true;
        if (state.isTrustedAccount) {
            await SpaceConnector.clientV2.identity.trustedAccount.update<TrustedAccountUpdateParameters, TrustedAccountModel>({
                trusted_account_id: props.serviceAccountId ?? '',
                name: state.baseInformationForm.accountName,
                data: state.baseInformationForm.customSchemaForm,
                tags: state.baseInformationForm.tags,
            });
        } else {
            await SpaceConnector.clientV2.identity.serviceAccount.update<ServiceAccountUpdateParameters, ServiceAccountModel>({
                service_account_id: props.serviceAccountId ?? '',
                service_account_mgr_id: state.baseInformationForm.serviceAccountManagerId,
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

</script>

<template>
    <p-pane-layout class="service-account-base-information">
        <p-heading-layout>
            <template #heading>
                <p-heading class="pt-8 px-4 pb-4"
                           heading-type="sub"
                           :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.BASE_TITLE')"
                />
            </template>
            <template #extra>
                <div class="h-full pt-8 px-4 pb-4">
                    <p-button v-if="state.mode === 'READ' && props.editable"
                              icon-left="ic_edit"
                              style-type="secondary"
                              @click="handleClickEditButton"
                    >
                        {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.EDIT') }}
                    </p-button>
                </div>
            </template>
        </p-heading-layout>
        <div class="content-wrapper">
            <service-account-base-information-detail v-show="state.mode === 'READ'"
                                                     :loading="props.serviceAccountLoading || state.loading"
            />
            <service-account-base-information-form v-if="state.mode === 'UPDATE'"
                                                   mode="UPDATE"
                                                   :schema="state.baseInformationSchema.schema"
                                                   @change="handleChangeForm"
            />
            <div v-if="state.mode === 'UPDATE'"
                 class="button-wrapper"
            >
                <p-button style-type="tertiary"
                          class="mr-4"
                          @click="handleClickCancelButton"
                >
                    {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.CANCEL') }}
                </p-button>
                <p-button style-type="primary"
                          :loading="state.loading"
                          :disabled="!state.isFormValid"
                          @click="handleClickSaveButton"
                >
                    {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.SAVE') }}
                </p-button>
            </div>
        </div>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.service-account-base-information {
    .content-wrapper {
        padding-top: 0.5rem;
        padding-bottom: 2.5rem;
        .service-account-base-information-form {
            padding-left: 1rem;
            padding-right: 1rem;
        }
        .button-wrapper {
            padding-left: 1rem;
        }
    }
}
</style>
