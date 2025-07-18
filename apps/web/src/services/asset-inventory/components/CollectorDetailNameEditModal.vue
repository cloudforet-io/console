<template>
    <p-button-modal :visible="props.visible"
                    :header-title="$t('INVENTORY.COLLECTOR.DETAIL.EDIT_COLLECTOR_NAME')"
                    :disabled="!state.isAllValid"
                    size="sm"
                    :loading="isUpdating"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <collector-name-form :loading="isUpdating"
                                 @update-valid="handleUpdateIsValid"
            />
        </template>
    </p-button-modal>
</template>

<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PButtonModal } from '@cloudforet/mirinae';

import { useCollectorApi } from '@/api-clients/inventory/collector/composables/use-collector-api';
import type { CollectorUpdateParameters } from '@/api-clients/inventory/collector/schema/api-verbs/update';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CollectorNameForm from '@/services/asset-inventory/components/CollectorFormName.vue';
import { useCollectorGetQuery } from '@/services/asset-inventory/composables/use-collector-get-query';
import { useCollectorFormStore } from '@/services/asset-inventory/stores/collector-form-store';


const props = defineProps<{
    visible: boolean;
}>();

const emits = defineEmits<{(event: 'update:visible', value: boolean): void;
}>();

const state = reactive({
    isAllValid: false,
});

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.state;
const { collectorAPI } = useCollectorApi();

/* Query */
const queryClient = useQueryClient();
const { data: originCollectorData, collectorGetQueryKey } = useCollectorGetQuery({
    collectorId: computed(() => collectorFormState.collectorId),
});
const { key: collectorListQueryKey } = useServiceQueryKey('inventory', 'collector', 'list');

/* Mutation */
const { mutate: updateCollectorName, isPending: isUpdating } = useMutation({
    mutationFn: (params: CollectorUpdateParameters) => collectorAPI.update(params),
    onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: collectorGetQueryKey.value });
        await queryClient.invalidateQueries({ queryKey: collectorListQueryKey.value });
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.ALT_S_CHANGE_COLLECTOR_NAME'), '');
        emits('update:visible', false);
    },
    onError: (error) => {
        collectorFormStore.setName(originCollectorData.value?.name ?? '');
        ErrorHandler.handleRequestError(error, i18n.t('INVENTORY.COLLECTOR.ALT_E_CHANGE_COLLECTOR_NAME'));
    },
});

const handleUpdateIsValid = (value: boolean) => {
    state.isAllValid = value;
};

const handleConfirm = () => {
    if (!collectorFormState.collectorId) return;

    updateCollectorName({
        collector_id: collectorFormState.collectorId,
        name: collectorFormState.name,
    });
};

const handleUpdateVisible = (visible: boolean) => {
    emits('update:visible', visible);
};


</script>
