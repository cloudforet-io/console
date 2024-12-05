<template>
    <p-pane-layout>
        <collector-detail-section-header :title="$t('INVENTORY.COLLECTOR.DETAIL.ATTACHED_SERVICE_ACCOUNTS')"
                                         :edit-mode="state.isEditMode"
                                         :hide-edit-button="!props.hasReadWriteAccess || !collectorDetailPageStore.getters.isEditableCollector"
                                         :total-count="state.totalCount"
                                         @click-edit="handleClickEdit"
        />

        <attached-service-accounts v-if="!state.isEditMode"
                                   :manage-disabled="props.manageDisabled"
                                   :has-read-write-access="props.hasReadWriteAccess"
                                   @update:totalCount="state.totalCount = $event"
        />

        <div v-else
             class="edit-form"
        >
            <attached-service-account-form :title="$t('INVENTORY.COLLECTOR.DETAIL.SELECT_SERVICE_ACCOUNT')"
                                           margin-on-specific
                                           reset-on-collector-id-change
                                           @update:isAttachedServiceAccountValid="handleChangeIsAttachedServiceAccountValid"
            />
            <div class="button-group">
                <p-button style-type="tertiary"
                          size="lg"
                          @click="handleClickCancel"
                >
                    {{ $t('INVENTORY.COLLECTOR.DETAIL.CANCEL') }}
                </p-button>
                <p-button style-type="primary"
                          size="lg"
                          class="save-changes-button"
                          :disabled="state.updateLoading || !state.isServiceAccountValid"
                          @click="handleClickSave"
                >
                    {{ $t('INVENTORY.COLLECTOR.DETAIL.SAVE_CHANGES') }}
                </p-button>
            </div>
        </div>
    </p-pane-layout>
</template>


<script lang="ts" setup>
import {
    reactive,
} from 'vue';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PPaneLayout,
} from '@cloudforet/mirinae';


import type { CollectorUpdateParameters } from '@/schema/inventory/collector/api-verbs/update';
import type {
    CollectorModel,

} from '@/schema/inventory/collector/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AttachedServiceAccounts
    from '@/services/asset-inventory/components/CollectorDetailAttachedServiceAccounts.vue';
import CollectorDetailSectionHeader from '@/services/asset-inventory/components/CollectorDetailSectionHeader.vue';
import AttachedServiceAccountForm from '@/services/asset-inventory/components/CollectorFormAttachedServiceAccount.vue';
import { useCollectorDetailPageStore } from '@/services/asset-inventory/stores/collector-detail-page-store';
import { useCollectorFormStore } from '@/services/asset-inventory/stores/collector-form-store';


const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.state;

const collectorDetailPageStore = useCollectorDetailPageStore();

const props = defineProps<{
    manageDisabled?: boolean;
    hasReadWriteAccess?: boolean
}>();

const state = reactive({
    totalCount: 0,
    isEditMode: false,
    isServiceAccountValid: false,
    updateLoading: false,
});


/* api fetchers */
const fetchCollectorUpdate = async (): Promise<CollectorModel> => {
    if (!collectorFormState.collectorId) throw new Error('collector_id is required');
    const originSecretFilter = collectorFormState.originCollector?.secret_filter ?? {};
    const params: CollectorUpdateParameters = {
        collector_id: collectorFormState.collectorId,
        secret_filter: {
            ...originSecretFilter,
            state: collectorFormState.attachedServiceAccountType === 'specific' ? 'ENABLED' : 'DISABLED',
        },
    };
    const serviceAccountParams = collectorFormState.selectedServiceAccountFilterOption === 'include' ? {
        service_accounts: collectorFormState.serviceAccounts,
        exclude_service_accounts: [],
    } : {
        exclude_service_accounts: collectorFormState.serviceAccounts,
        service_accounts: [],
    };
    Object.assign(params.secret_filter ?? {}, serviceAccountParams);
    return SpaceConnector.clientV2.inventory.collector.update<CollectorUpdateParameters, CollectorModel>(params);
};


/* event handlers */
const handleClickEdit = () => {
    const isExcludeOption = !!collectorFormState.originCollector?.secret_filter?.exclude_service_accounts?.length;
    if (isExcludeOption) {
        collectorFormStore.$patch((_state) => {
            _state.state.selectedServiceAccountFilterOption = 'exclude';
        });
    } else {
        collectorFormStore.$patch((_state) => {
            _state.state.selectedServiceAccountFilterOption = 'include';
        });
    }
    state.isEditMode = true;
};
const handleChangeIsAttachedServiceAccountValid = (value: boolean) => {
    state.isServiceAccountValid = value;
};
const handleClickCancel = () => {
    state.isEditMode = false;
};
const handleClickSave = async () => {
    try {
        state.updateLoading = true;
        const collector = await fetchCollectorUpdate();
        collectorFormStore.setOriginCollector(collector);
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.ALT_S_UPDATE_SERVICE_ACCOUNTS'), '');
        state.isEditMode = false;
    } catch (error) {
        collectorFormStore.resetAttachedServiceAccount();
        ErrorHandler.handleRequestError(error, i18n.t('INVENTORY.COLLECTOR.ALT_E_UPDATE_SERVICE_ACCOUNTS'));
    } finally {
        state.updateLoading = false;
    }
};



</script>

<style lang="postcss" scoped>
.edit-form {
    padding: 0 1rem;
    .button-group {
        margin-top: 1.5rem;
        margin-bottom: 2.5rem;
        .save-changes-button {
            margin-left: 1rem;
        }
    }
}
</style>
