<template>
    <p-pane-layout>
        <section-header :title="t('INVENTORY.COLLECTOR.DETAIL.ATTACHED_SERVICE_ACCOUNTS')"
                        :edit-mode="state.isEditMode"
                        :total-count="state.totalCount"
                        @click-edit="handleClickEdit"
        />

        <attached-service-accounts v-if="!state.isEditMode"
                                   :manage-disabled="props.manageDisabled"
                                   @update:total-count="state.totalCount = $event"
        />

        <div v-else
             class="edit-form"
        >
            <attached-service-account-form :title="t('INVENTORY.COLLECTOR.DETAIL.SELECT_SERVICE_ACCOUNT')"
                                           margin-on-specific
                                           reset-on-collector-id-change
                                           @update:is-attached-service-account-valid="handleChangeIsAttachedServiceAccountValid"
            />
            <div class="button-group">
                <p-button style-type="tertiary"
                          size="lg"
                          @click="handleClickCancel"
                >
                    {{ t('INVENTORY.COLLECTOR.DETAIL.CANCEL') }}
                </p-button>
                <p-button style-type="primary"
                          size="lg"
                          class="save-changes-button"
                          :disabled="state.updateLoading || !state.isServiceAccountValid"
                          @click="handleClickSave"
                >
                    {{ t('INVENTORY.COLLECTOR.DETAIL.SAVE_CHANGES') }}
                </p-button>
            </div>
        </div>
    </p-pane-layout>
</template>

<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PPaneLayout,
} from '@spaceone/design-system';
import {
    reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AttachedServiceAccounts
    from '@/services/asset-inventory/collector/collector-detail/modules/AttachedServiceAccounts.vue';
import SectionHeader from '@/services/asset-inventory/collector/collector-detail/modules/SectionHeader.vue';
import type {
    CollectorModel,
    CollectorUpdateParameter,
} from '@/services/asset-inventory/collector/model';
import AttachedServiceAccountForm from '@/services/asset-inventory/collector/shared/collector-forms/AttachedServiceAccountForm.vue';
import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';


const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const props = defineProps<{
    manageDisabled?: boolean;
}>();
const { t } = useI18n();

const state = reactive({
    totalCount: 0,
    isEditMode: false,
    isServiceAccountValid: false,
    updateLoading: false,
});


/* api fetchers */
const fetchCollectorUpdate = async (): Promise<CollectorModel> => {
    if (!collectorFormStore.collectorId) throw new Error('collector_id is required');
    const originSecretFilter = collectorFormState.originCollector?.secret_filter ?? {};
    const params: CollectorUpdateParameter = {
        collector_id: collectorFormStore.collectorId,
        secret_filter: {
            ...originSecretFilter,
            state: collectorFormState.attachedServiceAccountType === 'specific' ? 'ENABLED' : 'DISABLED',
        },
    };
    const serviceAccountParams = collectorFormState.selectedServiceAccountFilterOption === 'include' ? {
        service_accounts: collectorFormStore.serviceAccounts,
        exclude_service_accounts: [],
    } : {
        exclude_service_accounts: collectorFormStore.serviceAccounts,
        service_accounts: [],
    };
    Object.assign(params.secret_filter ?? {}, serviceAccountParams);
    return SpaceConnector.client.inventory.collector.update(params);
};


/* event handlers */
const handleClickEdit = () => {
    const isExcludeOption = !!collectorFormState.originCollector?.secret_filter?.exclude_service_accounts?.length;
    if (isExcludeOption) {
        collectorFormStore.$patch({
            selectedServiceAccountFilterOption: 'exclude',
        });
    } else {
        collectorFormStore.$patch({
            selectedServiceAccountFilterOption: 'include',
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
        showSuccessMessage(t('INVENTORY.COLLECTOR.ALT_S_UPDATE_SERVICE_ACCOUNTS'), '');
        state.isEditMode = false;
    } catch (error) {
        collectorFormStore.resetAttachedServiceAccount();
        ErrorHandler.handleRequestError(error, t('INVENTORY.COLLECTOR.ALT_E_UPDATE_SERVICE_ACCOUNTS'));
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
