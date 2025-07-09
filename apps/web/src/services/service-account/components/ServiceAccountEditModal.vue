<script lang="ts" setup>
import {
    computed,
    defineProps, reactive, watch,
} from 'vue';

import { PButtonModal, PFieldGroup, PTextInput } from '@cloudforet/mirinae';


import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useServiceAccountUpdateMutation } from '@/services/service-account/composables/mutations/use-service-account-update-mutation';
import { useTrustedAccountUpdateMutation } from '@/services/service-account/composables/mutations/use-trusted-account-update-mutation';
import { useServiceAccountListQuery } from '@/services/service-account/composables/queries/use-service-account-list-query';
import { useServiceAccountDetail } from '@/services/service-account/composables/use-service-account-detail';

const props = defineProps<{
    visible: boolean;
    serviceAccountId?: string;
}>();

const emits = defineEmits<{(event: 'update:visible', value: boolean): void;
}>();

const {
    serviceAccountData,
    isTrustedAccount,
} = useServiceAccountDetail({
    serviceAccountId: computed(() => props.serviceAccountId),
});


const {
    data: serviceAccountList,
} = useServiceAccountListQuery({
    params: computed(() => ({
        query: { only: ['name'] },
    })),
});

const serviceAccountNames = computed(() => serviceAccountList.value?.map((v) => v.name) ?? []);

const {
    forms: { serviceAccountName },
    invalidState,
    invalidTexts,
    setForm,
} = useFormValidator({
    serviceAccountName: serviceAccountData.value?.name ?? '',
}, {
    serviceAccountName: (val: string) => {
        if (val?.length < 2) {
            return i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_INVALID');
        } if (serviceAccountNames.value.includes(val)) {
            if (serviceAccountData.value?.name === val) return true;
            return i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_DUPLICATED');
        }
        return true;
    },
});

const state = reactive({
    isAllValid: false,
    proxyVisible: useProxyValue('visible', props, emits),
});

const { mutateAsync: updateServiceAccount, isPending: isUpdatingServiceAccount } = useServiceAccountUpdateMutation();
const { mutateAsync: updateTrustedAccount, isPending: isUpdatingTrustedAccount } = useTrustedAccountUpdateMutation();
const isLoading = computed(() => isUpdatingServiceAccount.value || isUpdatingTrustedAccount.value);
const handleConfirm = async () => {
    try {
        if (isTrustedAccount.value) {
            await updateTrustedAccount({
                trusted_account_id: props.serviceAccountId ?? '',
                name: serviceAccountName.value,
            });
        } else {
            await updateServiceAccount({
                service_account_id: props.serviceAccountId ?? '',
                name: serviceAccountName.value,
            });
        }
        showSuccessMessage(i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_S_UPDATE_BASE_INFO'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_E_UPDATE_BASE_INFO'));
    } finally {
        state.proxyVisible = false;
    }
};

watch(serviceAccountData, (newVal) => {
    setForm('serviceAccountName', newVal?.name ?? '');
}, { immediate: true });

</script>

<template>
    <p-button-modal :visible.sync="state.proxyVisible"
                    :header-title="$t('INVENTORY.SERVICE_ACCOUNT.DETAIL.EDIT_SERVICE_ACCOUNT_NAME')"
                    :disabled="invalidState.serviceAccountName"
                    size="sm"
                    :loading="isLoading"
                    @confirm="handleConfirm"
    >
        <template #body>
            <p-field-group :label="$t('INVENTORY.SERVICE_ACCOUNT.DETAIL.NAME')"
                           :invalid="invalidState.serviceAccountName"
                           :invalid-text="invalidTexts.serviceAccountName"
                           :required="true"
            >
                <template #default="{invalid}">
                    <p-text-input :value="serviceAccountName"
                                  class="account-name-input block"
                                  :invalid="invalid"
                                  :placeholder="$t('IDENTITY.SERVICE_ACCOUNT.ADD.BASE_NAME_PLACEHOLDER')"
                                  @update:value="setForm('serviceAccountName', $event)"
                    />
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>
