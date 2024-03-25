<script lang="ts" setup>
import {
    defineProps, defineEmits, reactive, nextTick,
} from 'vue';

import { PButtonModal, PFieldGroup, PTextInput } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ServiceAccountListParameters } from '@/schema/identity/service-account/api-verbs/list';
import type { ServiceAccountUpdateParameters } from '@/schema/identity/service-account/api-verbs/update';
import type { ServiceAccountModel } from '@/schema/identity/service-account/model';
import type { TrustedAccountUpdateParameters } from '@/schema/identity/trusted-account/api-verbs/update';
import type { TrustedAccountModel } from '@/schema/identity/trusted-account/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

const props = defineProps<{
    visible: boolean;
    serviceAccount: ServiceAccountModel;
    isTrustedAccount: boolean;
}>();

const emits = defineEmits<{(event: 'update:visible', value: boolean): void;
}>();
const {
    forms: { serviceAccountName },
    invalidState,
    invalidTexts,
    setForm,
} = useFormValidator({
    serviceAccountName: props.serviceAccount.name,
}, {
    serviceAccountName: (val: string) => {
        if (val?.length < 2) {
            return i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_INVALID');
        } if (state.serviceAccountNames.includes(val)) {
            if (props.serviceAccount.name === val) return true;
            return i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_DUPLICATED');
        }
        return true;
    },
});

const state = reactive({
    serviceAccountNames: [] as string[],
    isAllValid: false,
    loading: false,
});

const updateServiceAccountName = async () => {
    if (props.isTrustedAccount) {
        await SpaceConnector.clientV2.identity.trustedAccount.update<TrustedAccountUpdateParameters, TrustedAccountModel>({
            trusted_account_id: props.serviceAccount.trusted_account_id ?? '',
            name: serviceAccountName.value,
        });
    } else {
        await SpaceConnector.clientV2.identity.serviceAccount.update<ServiceAccountUpdateParameters, ServiceAccountModel>({
            service_account_id: props.serviceAccount.service_account_id ?? '',
            name: serviceAccountName.value,
        });
    }
};


const handleConfirm = async () => {
    try {
        state.loading = true;
        await updateServiceAccountName();
        emits('update:visible', false);
        showSuccessMessage(i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_S_UPDATE_BASE_INFO'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_E_UPDATE_BASE_INFO'));
    } finally {
        state.loading = false;
    }
};
const handleUpdateVisible = (visible: boolean) => {
    emits('update:visible', visible);
};

const listServiceAccounts = async () => {
    const { results } = await SpaceConnector.clientV2.identity.serviceAccount.list<ServiceAccountListParameters, ListResponse<ServiceAccountModel>>({
        query: {
            only: ['name'],
        },
    });
    state.serviceAccountNames = (results ?? []).map((v) => v.name);
};
(async () => {
    await listServiceAccounts();
    await nextTick();
    setForm('serviceAccountName', props.serviceAccount.name);
})();

</script>

<template>
    <p-button-modal :visible="props.visible"
                    :header-title="$t('INVENTORY.COLLECTOR.DETAIL.EDIT_COLLECTOR_NAME')"
                    :disabled="invalidState.serviceAccountName"
                    size="sm"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <p-field-group :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_LABEL')"
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
