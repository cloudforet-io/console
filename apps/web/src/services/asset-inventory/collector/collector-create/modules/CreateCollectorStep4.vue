<template>
    <div class="collector-page-4">
        <collector-schedule-form disable-loading />
        <div class="step-footer">
            <p-text-button icon-left="ic_chevron-left"
                           style-type="highlight"
                           class="step-left-text-button"
                           @click="handleClickOtherPluginButton"
            >
                {{ t('INVENTORY.COLLECTOR.CREATE.SELECT_OTHER_PLUGIN') }}
            </p-text-button>
            <div class="right-area">
                <p-button icon-left="ic_arrow-left"
                          style-type="transparent"
                          size="lg"
                          @click="handleClickPrevButton"
                >
                    {{ t('INVENTORY.COLLECTOR.CREATE.PREVIOUS') }}
                </p-button>
                <p-button :disabled="!state.isAbleToCreateCollector"
                          size="lg"
                          :loading="state.createLoading"
                          @click="handleClickCreateButton"
                >
                    {{ t('INVENTORY.COLLECTOR.CREATE.CREATE_NEW_COLLECTOR') }}
                </p-button>
            </div>
        </div>
        <delete-modal v-model:visible="state.deleteModalVisible"
                      :header-title="t('INVENTORY.COLLECTOR.CREATE.PREV_MODAL_TITLE')"
                      :contents="t('INVENTORY.COLLECTOR.CREATE.PREV_MODAL_CONTENT')"
                      size="sm"
                      @confirm="handleClose"
        />
        <p-button-modal v-model:visible="state.visibleCreateCompleteModal"
                        :header-title="t('INVENTORY.COLLECTOR.CREATE.CREATE_COMPLETE_MODAL_TITLE')"
                        :loading="state.collectLoading"
                        @confirm="handleConfirmCreateCollector"
                        @cancel="goToCollectorDetailPage"
                        @close="goToCollectorDetailPage"
        >
            <template #close-button>
                {{ t('INVENTORY.COLLECTOR.CREATE.CREATE_COMPLETE_MODAL_SKIP') }}
            </template>
            <template #confirm-button>
                {{ t('INVENTORY.COLLECTOR.CREATE.CREATE_COMPLETE_MODAL_COLLECT') }}
            </template>
        </p-button-modal>
    </div>
</template>

<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PTextButton, PButtonModal,
} from '@spaceone/design-system';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CollectorCreateParameter, CollectorModel } from '@/services/asset-inventory/collector/model';
import {
    useCollectorFormStore,
} from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
import CollectorScheduleForm from '@/services/asset-inventory/collector/shared/collector-forms/CollectorScheduleForm.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const emit = defineEmits<{(e: 'update:current-step', value: number): void}>();
const { t } = useI18n();
const router = useRouter();

const state = reactive<{
    deleteModalVisible: boolean;
    isAbleToCreateCollector: boolean;
    visibleCreateCompleteModal: boolean;
    createLoading: boolean;
    collectLoading: boolean;
    createdCollectorId?: string;
}>({
    deleteModalVisible: false,
    isAbleToCreateCollector: true,
    visibleCreateCompleteModal: false,
    createLoading: false,
    collectLoading: false,
    createdCollectorId: undefined,
});

const handleClickPrevButton = () => {
    emit('update:current-step', 3);
};

const handleClickCreateButton = async () => {
    try {
        state.createLoading = true;
        const params: CollectorCreateParameter = {
            name: collectorFormState.name,
            provider: collectorFormState.provider ?? collectorFormState.repositoryPlugin?.provider,
            plugin_info: {
                plugin_id: collectorFormState.repositoryPlugin?.plugin_id,
                version: collectorFormState.version,
                options: collectorFormState.options,
                upgrade_mode: collectorFormState.autoUpgrade ? 'AUTO' : 'MANUAL',
            },
            secret_filter: {
                state: collectorFormState.attachedServiceAccountType === 'all' ? 'DISABLED' : 'ENABLED',
            },
            schedule: {
                state: collectorFormState.schedulePower ? 'ENABLED' : 'DISABLED',
                hours: collectorFormState.scheduleHours,
            },
            tags: collectorFormState.tags,
        };
        const serviceAccountParams = collectorFormState.selectedServiceAccountFilterOption === 'include' ? {
            service_accounts: collectorFormStore.serviceAccounts,
        } : {
            exclude_service_accounts: collectorFormStore.serviceAccounts,
        };
        Object.assign(params.secret_filter ?? {}, serviceAccountParams);
        const res:CollectorModel = await SpaceConnector.client.inventory.collector.create(params);
        state.createdCollectorId = res?.collector_id;
        state.visibleCreateCompleteModal = true;
        showSuccessMessage(t('INVENTORY.COLLECTOR.CREATE.ALT_S_CREATE_COLLECTOR'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('INVENTORY.COLLECTOR.CREATE.ALT_E_CREATE_COLLECTOR'));
    } finally {
        state.createLoading = false;
    }
};

const handleClickOtherPluginButton = () => {
    state.deleteModalVisible = true;
};

const handleClose = () => {
    emit('update:current-step', 1);
    state.deleteModalVisible = false;
};

const handleConfirmCreateCollector = async () => {
    try {
        state.collectLoading = true;
        // After the collector created, if the user clicks the collect button, the collector will be executed.
        await SpaceConnector.client.inventory.collector.collect({
            collector_id: state.createdCollectorId,
        });
        showSuccessMessage(t('INVENTORY.COLLECTOR.CREATE.ALT_S_COLLECT_EXECUTION'), '');
        goToCollectorDetailPage();
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('INVENTORY.COLLECTOR.CREATE.ALT_E_COLLECT_EXECUTION'));
    } finally {
        state.collectLoading = false;
    }
};

const goToCollectorDetailPage = () => {
    state.visibleCreateCompleteModal = false;
    if (state.createdCollectorId) {
        router.push({
            name: ASSET_INVENTORY_ROUTE.COLLECTOR.DETAIL._NAME,
            params: {
                collectorId: state.createdCollectorId,
            },
        });
    }
};

</script>

<style scoped lang="postcss">
.collector-page-4 {
    min-width: 40rem;

    .step-footer {
        @apply flex justify-between items-center;
        margin-top: 4.25rem;

        .right-area {
            @apply flex items-center;
            & > :first-child {
                margin-right: 1rem;
            }
        }
    }
}

@screen mobile {
    .collector-page-4 {
        min-width: unset;
        max-width: 100vw;

        .step-footer {
            @apply flex justify-between items-center;
            margin-top: 2rem;

            .step-left-text-button {
                display: none;
            }
        }
    }
}
</style>

