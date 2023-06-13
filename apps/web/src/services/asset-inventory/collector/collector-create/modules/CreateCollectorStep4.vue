<template>
    <div class="collector-page-4">
        <collector-schedule-form disable-first-loading />
        <div class="step-footer">
            <p-text-button icon-left="ic_chevron-left"
                           style-type="highlight"
                           class="step-left-text-button"
                           @click="handleClickOtherPluginButton"
            >
                {{ $t('INVENTORY.COLLECTOR.CREATE.SELECT_OTHER_PLUGIN') }}
            </p-text-button>
            <div class="right-area">
                <p-button icon-left="ic_arrow-left"
                          style-type="transparent"
                          size="lg"
                          @click="handleClickPrevButton"
                >
                    {{ $t('INVENTORY.COLLECTOR.CREATE.PREVIOUS') }}
                </p-button>
                <p-button :disabled="!state.isAbleToCreateCollector"
                          size="lg"
                          @click="handleClickCreateButton"
                >
                    {{ $t('INVENTORY.COLLECTOR.CREATE.CREATE_NEW_COLLECTOR') }}
                </p-button>
            </div>
        </div>
        <delete-modal :header-title="$t('INVENTORY.COLLECTOR.CREATE.PREV_MODAL_TITLE')"
                      :visible.sync="state.deleteModalVisible"
                      :contents="$t('INVENTORY.COLLECTOR.CREATE.PREV_MODAL_CONTENT')"
                      size="sm"
                      @confirm="handleClose"
        />
        <p-button-modal :visible.sync="state.visibleCreateModal"
                        :header-title="$t('INVENTORY.COLLECTOR.CREATE.CREATE_COMPLETE_MODAL_TITLE')"
                        @confirm="handleConfirmCreateCollector"
                        @cancel="handleRouteToCollectorList"
                        @close="handleRouteToCollectorList"
        >
            <template #close-button>
                {{ $t('INVENTORY.COLLECTOR.CREATE.CREATE_COMPLETE_MODAL_SKIP') }}
            </template>
            <template #confirm-button>
                {{ $t('INVENTORY.COLLECTOR.CREATE.CREATE_COMPLETE_MODAL_COLLECT') }}
            </template>
        </p-button-modal>
    </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';

import {
    PButton, PTextButton, PButtonModal,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    useCollectorFormStore,
} from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
import CollectorScheduleForm from '@/services/asset-inventory/collector/shared/collector-forms/CollectorScheduleForm.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const emit = defineEmits([
    'update:currentStep',
]);

const state = reactive<{
    deleteModalVisible: boolean;
    isAbleToCreateCollector: boolean;
    visibleCreateModal: boolean;
    loading: boolean;
}>({
    deleteModalVisible: false,
    isAbleToCreateCollector: true,
    visibleCreateModal: false,
    loading: false,
});

const handleClickPrevButton = () => {
    emit('update:currentStep', 3);
};

const convertAttachedServiceAccountToIds = () => (collectorFormState.attachedServiceAccount)?.map((d) => d.name) ?? [];


const handleClickCreateButton = async () => {
    try {
        state.loading = true;
        await SpaceConnector.client.inventory.collector.create({
            name: collectorFormState.name,
            provider: collectorFormState.repositoryPlugin?.provider,
            plugin_info: {
                plugin_id: collectorFormState.repositoryPlugin?.plugin_id,
                version: collectorFormState.version,
                secret_filter: {
                    state: collectorFormState.attachedServiceAccountType === 'all' ? 'DISABLED' : 'ENABLED',
                    service_accounts: convertAttachedServiceAccountToIds(),
                },
                options: collectorFormState.options,
                upgrade_mode: collectorFormState.autoUpgrade ? 'AUTO' : 'MANUAL',
            },
            schedule: {
                state: collectorFormState.schedulePower ? 'ENABLED' : 'DISABLED',
                hours: collectorFormState.scheduleHours,
            },
            tags: collectorFormState.tags,
        });
        state.visibleCreateModal = true;
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_S_CREATE_COLLECTOR'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_E_CREATE_COLLECTOR'));
    } finally {
        state.loading = false;
    }
};

const handleClickOtherPluginButton = () => {
    state.deleteModalVisible = true;
};

const handleClose = () => {
    emit('update:currentStep', 1);
};

const handleConfirmCreateCollector = () => {
    // TODO: logic for collect now
    state.visibleCreateModal = false;
};

const handleRouteToCollectorList = () => {
    state.visibleCreateModal = false;
    SpaceRouter.router.push({ name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME });
};

(() => {
})();
</script>

<style scoped lang="postcss">
.collector-page-4 {
    min-width: 40rem;

    .step-footer {
        @apply flex justify-between items-center;
        margin-top: 4.25rem;

        .right-area {
            @apply flex items-center;
            :first-child {
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

