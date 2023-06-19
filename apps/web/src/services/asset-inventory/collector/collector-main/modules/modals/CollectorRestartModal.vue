<template>
    <p-button-modal :header-title="$t('INVENTORY.COLLECTOR.MAIN.RESTART_COLLECT')"
                    size="sm"
                    fade
                    backdrop
                    :visible="collectorPageState.visibleRestartModal"
                    :loading="state.loading"
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
import { reactive } from 'vue';

import { PButtonModal } from '@spaceone/design-system';

import { useCollectorPageStore } from '@/services/asset-inventory/collector/collector-main/collector-page-store';

const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.$state;

const emit = defineEmits<{(e: 'refresh-collector-list'): void}>();

const state = reactive({
    loading: false,
});

/* Components */
const handleCloseModal = () => {
    collectorPageStore.$patch({
        visibleRestartModal: false,
    });
};

/* API */
const handleConfirm = async () => {
    state.loading = true;
    try {
        const collectorId = collectorPageStore.selectedCollector.collector_id;
        await collectorPageStore.restartCollector(collectorId);
        emit('refresh-collector-list');
        handleCloseModal();
    } finally {
        state.loading = false;
    }
};
</script>
