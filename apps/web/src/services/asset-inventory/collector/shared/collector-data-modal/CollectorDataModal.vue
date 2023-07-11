<template>
    <div class="collector-data-modal">
        <p-button-modal :visible="collectorPageState.visibleCollectorModal"
                        :header-title="state.headerTitle"
                        :theme-color="props.isDuplicateJobs ? 'alert' : 'primary'"
                        :loading="state.loading"
                        size="sm"
                        @confirm="handleClickConfirm"
                        @cancel="handleClickCancel"
                        @close="handleClickCancel"
        >
            <template #body>
                <div v-if="props.isDuplicateJobs">
                    <collector-data-duplication-inner :account-type="props.accountType" />
                </div>
                <collector-data-default-inner v-else />
            </template>
            <template #confirm-button>
                <span v-if="props.isDuplicateJobs">{{ $t('INVENTORY.COLLECTOR.MAIN.RESTART') }}</span>
                <span v-else>{{ $t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.CONFIRM_BUTTON') }}</span>
            </template>
        </p-button-modal>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PButtonModal } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useCollectorPageStore } from '@/services/asset-inventory/collector/collector-main/collector-page-store';
import {
    useCollectorDataModalStore,
} from '@/services/asset-inventory/collector/shared/collector-data-modal/collector-data-modal-store';
import CollectorDataDefaultInner
    from '@/services/asset-inventory/collector/shared/collector-data-modal/modules/CollectorDataDefaultInner.vue';
import CollectorDataDuplicationInner
    from '@/services/asset-inventory/collector/shared/collector-data-modal/modules/CollectorDataDuplicationInner.vue';
import { ACCOUNT_TYPE, COLLECT_DATA_TYPE } from '@/services/asset-inventory/collector/shared/collector-data-modal/type';

interface Props {
    collectDataType?: string;
    accountType?: string;
    isDuplicateJobs?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    collectDataType: COLLECT_DATA_TYPE.COLLECTOR,
    accountType: ACCOUNT_TYPE.ALL,
    isDuplicateJobs: false,
});

const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.$state;
const collectorDataModalStore = useCollectorDataModalStore();
const collectorDataModalState = collectorDataModalStore.$state;


const state = reactive({
    loading: false,
    headerTitle: computed(() => (props.isDuplicateJobs ? i18n.t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.DUPLICATION_TITLE') : i18n.t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.TITLE'))),
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
