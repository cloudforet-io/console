<script setup lang="ts">
import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import {
    PButton, PPaneLayout, PHeading, PHeadingLayout,
} from '@cloudforet/mirinae';

import type { SchemaModel } from '@/api-clients/identity/schema/schema/model';
import { ACCOUNT_TYPE } from '@/api-clients/identity/service-account/schema/constant';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import ServiceAccountBaseInformationDetail
    from '@/services/service-account/components/ServiceAccountBaseInformationDetail.vue';
import ServiceAccountBaseInformationForm
    from '@/services/service-account/components/ServiceAccountBaseInformationForm.vue';
import { useServiceAccountUpdateMutation } from '@/services/service-account/composables/mutations/use-service-account-update-mutation';
import { useTrustedAccountUpdateMutation } from '@/services/service-account/composables/mutations/use-trusted-account-update-mutation';
import { useServiceAccountProviderSchema } from '@/services/service-account/composables/use-service-account-provider-schema';
import { useServiceAccountPageStore } from '@/services/service-account/stores/service-account-page-store';
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

const serviceAccountPageStore = useServiceAccountPageStore();

const {
    generalAccountSchema,
    trustedAccountSchema,
} = useServiceAccountProviderSchema();

interface State {
    isTrustedAccount: ComputedRef<boolean>;
    mode: PageMode;
    isFormValid: ComputedRef<boolean|undefined>;
    baseInformationSchema: ComputedRef<SchemaModel|undefined>;
    baseInformationForm: ComputedRef<Partial<BaseInformationForm>>;
}
const state = reactive<State>({
    isTrustedAccount: computed(() => serviceAccountPageStore.state.serviceAccountType === ACCOUNT_TYPE.TRUSTED),
    mode: 'READ',
    isFormValid: computed(() => serviceAccountPageStore.formState.isBaseInformationFormValid),
    baseInformationSchema: computed(() => (state.isTrustedAccount ? trustedAccountSchema.value : generalAccountSchema.value)),
    baseInformationForm: computed(() => serviceAccountPageStore.formState.baseInformation),
});

/* Api */
const { mutateAsync: updateServiceAccount, isPending: isUpdateServiceAccountPending } = useServiceAccountUpdateMutation();
const { mutateAsync: updateTrustedAccount, isPending: isUpdateTrustedAccountPending } = useTrustedAccountUpdateMutation();
const isLoading = computed(() => isUpdateServiceAccountPending.value || isUpdateTrustedAccountPending.value);

/* Event */
const handleClickEditButton = () => {
    state.mode = 'UPDATE';
};
const handleClickCancelButton = () => {
    state.mode = 'READ';
};
const handleClickSaveButton = async () => {
    if (!state.isFormValid) return;
    try {
        if (state.isTrustedAccount) {
            await updateTrustedAccount({
                trusted_account_id: props.serviceAccountId ?? '',
                name: state.baseInformationForm.accountName,
                data: state.baseInformationForm.customSchemaForm,
                tags: state.baseInformationForm.tags,
            });
        } else {
            await updateServiceAccount({
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
        state.mode = 'READ';
    }
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
                                                     :service-account-id="props.serviceAccountId"
                                                     :loading="props.serviceAccountLoading || isLoading"
            />
            <service-account-base-information-form v-if="state.mode === 'UPDATE'"
                                                   mode="UPDATE"
                                                   :schema="state.baseInformationSchema.schema"
                                                   :service-account-id="props.serviceAccountId"
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
                          :loading="isLoading"
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
