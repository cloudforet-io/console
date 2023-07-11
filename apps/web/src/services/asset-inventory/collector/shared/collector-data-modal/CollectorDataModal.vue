<template>
    <div class="collector-data-modal">
        <p-double-check-modal v-if="props.isDuplicateJobs"
                              :visible="collectorPageState.visibleCollectorModal"
                              modal-size="sm"
                              verification-text="test"
                              @confirm="handleClickConfirm"
                              @cancel="handleClickCancel"
        >
            <!-- TODO: will be implemented after-->
            test
        </p-double-check-modal>
        <p-button-modal v-else
                        :visible="collectorPageState.visibleCollectorModal"
                        :header-title="$t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.TITLE')"
                        :loading="state.loading"
                        size="sm"
                        @confirm="handleClickConfirm"
                        @cancel="handleClickCancel"
                        @close="handleClickCancel"
        >
            <template #body>
                <span>{{ $t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.DESCRIPTION') }}</span>
                <div class="accounts-wrapper">
                    <p-lazy-img :src="collectorDataModalStore.selectedCollector.plugin.icon"
                                width="1rem"
                                height="1rem"
                                class="plugin-icon"
                    />
                    <span>{{ collectorDataModalStore.selectedCollector.name }}</span>
                    <span v-if="collectorDataModalState.secrets.length > 0">
                        ({{ collectorDataModalState.secrets.length }})
                    </span>
                </div>
            </template>
            <template #confirm-button>
                <span>{{ $t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.CONFIRM_BUTTON') }}</span>
            </template>
        </p-button-modal>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import { PButtonModal, PDoubleCheckModal, PLazyImg } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useCollectorPageStore } from '@/services/asset-inventory/collector/collector-main/collector-page-store';
import {
    useCollectorDataModalStore,
} from '@/services/asset-inventory/collector/shared/collector-data-modal/collector-data-modal-store';
import { ACCOUNT_TYPE, COLLECT_DATA_TYPE } from '@/services/asset-inventory/collector/shared/collector-data-modal/type';

interface Props {
    state?: string;
    accountType?: string;
    isDuplicateJobs?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    state: COLLECT_DATA_TYPE.COLLECTOR,
    accountType: ACCOUNT_TYPE.ALL,
    isDuplicateJobs: false,
});

const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.$state;
const collectorDataModalStore = useCollectorDataModalStore();
const collectorDataModalState = collectorDataModalStore.$state;

const state = reactive({
    loading: false,
});

const emit = defineEmits<{(e: 'click-confirm'): void}>();

/* Components */
const handleClickCancel = () => {
    collectorPageStore.$patch({
        visibleCollectorModal: false,
    });
};
const handleClickConfirm = async () => {
    state.loading = true;
    try {
        await SpaceConnector.client.inventory.collector.collect({
            collector_id: collectorDataModalState.selectedCollector.collector_id,
            secret_id: collectorDataModalState.selectedSecret.secret_id,
        });
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_S_COLLECT_EXECUTION'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_E_COLLECT_EXECUTION'));
        throw e;
    } finally {
        state.loading = false;
        emit('click-confirm');
        handleClickCancel();
    }
};
</script>

<style lang="postcss" scoped>
.collector-data-modal {
    .accounts-wrapper {
        @apply flex items-center bg-gray-100 text-paragraph-md;
        margin-top: 0.5rem;
        padding: 0.5rem 1rem;
        gap: 0.5rem;
    }
}
</style>
