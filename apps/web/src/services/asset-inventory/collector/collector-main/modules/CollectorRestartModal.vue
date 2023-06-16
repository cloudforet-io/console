<template>
    <p-button-modal :header-title="$t('INVENTORY.COLLECTOR.MAIN.RESTART_COLLECT')"
                    size="sm"
                    fade
                    backdrop
                    :visible="collectorPageState.visibleRestartModal"
                    @close="handleCloseModal"
                    @cancel="handleCloseModal"
                    @confirm="handleConfirm"
    />
</template>

<script setup lang="ts">
import { PButtonModal } from '@spaceone/design-system';

import { useCollectorPageStore } from '@/services/asset-inventory/collector/collector-main/collector-page-store';

const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.$state;

const handleCloseModal = () => {
    collectorPageStore.$patch({
        visibleRestartModal: false,
    });
};
const handleConfirm = async () => {
    console.log('!');
};
</script>
