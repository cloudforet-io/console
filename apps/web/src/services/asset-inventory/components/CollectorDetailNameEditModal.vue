<template>
    <p-button-modal :visible="props.visible"
                    :header-title="$t('INVENTORY.COLLECTOR.DETAIL.EDIT_COLLECTOR_NAME')"
                    :disabled="!state.isAllValid"
                    size="sm"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <collector-name-form :loading="state.loading"
                                 @update-valid="handleUpdateIsValid"
            />
        </template>
    </p-button-modal>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';

import { PButtonModal } from '@cloudforet/mirinae';

import { useCollectorApi } from '@/api-clients/inventory/collector/composables/use-collector-api';
import type { CollectorUpdateParameters } from '@/api-clients/inventory/collector/schema/api-verbs/update';
import type { CollectorModel } from '@/api-clients/inventory/collector/schema/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CollectorNameForm from '@/services/asset-inventory/components/CollectorFormName.vue';
import { useCollectorFormStore } from '@/services/asset-inventory/stores/collector-form-store';


const props = defineProps<{
    visible: boolean;
}>();

const emits = defineEmits<{(event: 'update:visible', value: boolean): void;
}>();

const state = reactive({
    isAllValid: false,
    loading: false,
});

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.state;
const { collectorAPI } = useCollectorApi();

const fetchUpdateCollectorName = async (): Promise<CollectorModel> => {
    if (!collectorFormState.collectorId) throw new Error('collector_id is required');
    const params: CollectorUpdateParameters = {
        collector_id: collectorFormState.collectorId,
        name: collectorFormState.name,
    };
    return collectorAPI.update(params);
};

const handleUpdateIsValid = (value: boolean) => {
    state.isAllValid = value;
};
const handleConfirm = async () => {
    try {
        state.loading = true;
        const collector = await fetchUpdateCollectorName();
        emits('update:visible', false);
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.ALT_S_CHANGE_COLLECTOR_NAME'), '');
        collectorFormStore.setOriginCollector(collector);
    } catch (e) {
        collectorFormStore.resetName();
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.ALT_E_CHANGE_COLLECTOR_NAME'));
    } finally {
        state.loading = false;
    }
};
const handleUpdateVisible = (visible: boolean) => {
    emits('update:visible', visible);
};


</script>
