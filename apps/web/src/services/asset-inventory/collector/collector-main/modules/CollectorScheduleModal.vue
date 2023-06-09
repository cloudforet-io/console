<template>
    <p-button-modal class="collector-schedule-modal"
                    :header-title="props.state === 'set' ? $t('INVENTORY.COLLECTOR.MAIN.EDIT_SCHEDULE') : $t('INVENTORY.COLLECTOR.MAIN.SET_SCHEDULE') "
                    size="md"
                    fade
                    backdrop
                    :visible="collectorPageState.visibleModal"
                    @close="handleCloseModal"
    >
        <template #body>
            <!-- TODO: changed condition after API spec checking -->
            <collector-schedule-form :edit-mode="false" />
        </template>
    </p-button-modal>
</template>

<script setup lang="ts">
import { PButtonModal } from '@spaceone/design-system';

import { useCollectorPageStore } from '@/services/asset-inventory/collector/collector-main/collector-page-store';
import CollectorScheduleForm
    from '@/services/asset-inventory/collector/shared/collector-forms/CollectorScheduleForm.vue';

interface IProps {
    state: string
}

const props = withDefaults(defineProps<IProps>(), {
    state: 'set',
});

const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.$state;

/* Components */
const handleCloseModal = () => {
    collectorPageStore.$patch({
        visibleModal: false,
    });
};
</script>
