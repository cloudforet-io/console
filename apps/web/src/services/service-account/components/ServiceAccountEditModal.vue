<script lang="ts" setup>
import {
    defineProps, reactive,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal, PFieldGroup, PTextInput } from '@cloudforet/mirinae';


import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ServiceAccountListParameters } from '@/api-clients/identity/service-account/schema/api-verbs/list';
import type { ServiceAccountUpdateParameters } from '@/api-clients/identity/service-account/schema/api-verbs/update';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';
import type { TrustedAccountListParameters } from '@/api-clients/identity/trusted-account/schema/api-verbs/list';
import type { TrustedAccountUpdateParameters } from '@/api-clients/identity/trusted-account/schema/api-verbs/update';
import type { TrustedAccountModel } from '@/api-clients/identity/trusted-account/schema/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useServiceAccountPageStore } from '@/services/service-account/stores/service-account-page-store';

const props = defineProps<{
    visible: boolean;
    serviceAccount: Partial<TrustedAccountModel & ServiceAccountModel>;
    isTrustedAccount: boolean;
}>();

const emits = defineEmits<{(event: 'update:visible', value: boolean): void;
}>();
const serviceAccountPageStore = useServiceAccountPageStore();

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
    proxyVisible: useProxyValue('visible', props, emits),
});


const updateServiceAccountName = async () => {
    let results: ServiceAccountModel|TrustedAccountModel;
    if (props.isTrustedAccount) {
        results = await SpaceConnector.clientV2.identity.trustedAccount.update<TrustedAccountUpdateParameters, TrustedAccountModel>({
            trusted_account_id: props.serviceAccount.trusted_account_id ?? '',
            name: serviceAccountName.value,
        });
    } else {
        results = await SpaceConnector.clientV2.identity.serviceAccount.update<ServiceAccountUpdateParameters, ServiceAccountModel>({
            service_account_id: props.serviceAccount.service_account_id ?? '',
            name: serviceAccountName.value,
        });
    }
    serviceAccountPageStore.$patch((store) => {
        store.state.originServiceAccountItem.name = results.name;
    });
    state.proxyVisible = false;
};


const handleConfirm = async () => {
    try {
        state.loading = true;
        await updateServiceAccountName();
        showSuccessMessage(i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_S_UPDATE_BASE_INFO'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_E_UPDATE_BASE_INFO'));
    } finally {
        state.loading = false;
    }
};

const listServiceAccounts = async () => {
    let results:(TrustedAccountModel | ServiceAccountModel)[] = [];
    if (props.isTrustedAccount) {
        const trustedAccountList = await SpaceConnector.clientV2.identity.trustedAccount.list<TrustedAccountListParameters, ListResponse<TrustedAccountModel>>({
            query: {
                only: ['name'],
            },
        });
        results = trustedAccountList.results ?? [];
    } else {
        const generalAccountList = await SpaceConnector.clientV2.identity.serviceAccount.list<ServiceAccountListParameters, ListResponse<ServiceAccountModel>>({
            query: {
                only: ['name'],
            },
        });
        results = generalAccountList.results ?? [];
    }
    state.serviceAccountNames = (results ?? []).map((v) => v.name);
};

(() => {
    listServiceAccounts();
    setForm('serviceAccountName', props.serviceAccount.name);
})();

</script>

<template>
    <p-button-modal :visible.sync="state.proxyVisible"
                    :header-title="$t('INVENTORY.SERVICE_ACCOUNT.DETAIL.EDIT_SERVICE_ACCOUNT_NAME')"
                    :disabled="invalidState.serviceAccountName"
                    size="sm"
                    :loading="state.loading"
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
