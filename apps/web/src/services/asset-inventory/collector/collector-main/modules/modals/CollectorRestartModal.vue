<template>
    <p-button-modal :header-title="$t('INVENTORY.COLLECTOR.MAIN.RESTART_COLLECT')"
                    size="sm"
                    fade
                    backdrop
                    :visible="collectorPageState.visibleRestartModal"
                    :loading="collectorPageState.collectorLoading"
                    @close="handleCloseModal"
                    @cancel="handleCloseModal"
                    @confirm="handleConfirm"
    >
        <template #confirm-button>
            {{ $t('INVENTORY.COLLECTOR.MAIN.RESTART') }}
        </template>
    </p-button-modal>
</template>

<script setup lang="ts">
import { PButtonModal } from '@spaceone/design-system';

import { useCollectorPageStore } from '@/services/asset-inventory/collector/collector-main/collector-page-store';

const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.$state;

const emit = defineEmits<{(e: 'refresh-collector-list'): void}>();

/* Components */
const handleCloseModal = () => {
    collectorPageStore.$patch({
        visibleRestartModal: false,
    });
};

/* API */
const handleConfirm = async () => {
    const collectorId = collectorPageStore.selectedCollector.collector_id;
    await collectorPageStore.restartCollector(collectorId);
    emit('refresh-collector-list');
    handleCloseModal();
};
</script>
