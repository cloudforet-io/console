<template>
    <div class="collector-page-4">
        <collector-schedule-form disable-loading />
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
                          :loading="state.createLoading"
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
        <p-button-modal :visible.sync="state.visibleCreateCompleteModal"
                        :header-title="$t('INVENTORY.COLLECTOR.CREATE.CREATE_COMPLETE_MODAL_TITLE')"
                        :loading="state.collectLoading"
                        @confirm="handleConfirmCreateCollector"
                        @cancel="goToCollectorDetailPage"
                        @close="goToCollectorDetailPage"
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
import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PTextButton, PButtonModal,
} from '@cloudforet/mirinae';


import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { CollectorCollectParameters } from '@/schema/inventory/collector/api-verbs/collect';
import type { CollectorCreateParameters } from '@/schema/inventory/collector/api-verbs/create';
import type { CollectorModel } from '@/schema/inventory/collector/model';
import type { JobModel } from '@/schema/inventory/job/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import CollectorScheduleForm from '@/services/asset-inventory/components/CollectorFormSchedule.vue';
import { ADMIN_ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/admin/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import {
    useCollectorFormStore,
} from '@/services/asset-inventory/stores/collector-form-store';


const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.state;
const appContextStore = useAppContextStore();
const router = useRouter();
const emit = defineEmits([
    'update:currentStep',
]);

const state = reactive<{
    deleteModalVisible: boolean;
    isAbleToCreateCollector: boolean;
    visibleCreateCompleteModal: boolean;
    createLoading: boolean;
    collectLoading: boolean;
    createdCollectorId?: string;
    isAdminMode: ComputedRef<boolean>;
}>({
    deleteModalVisible: false,
    isAbleToCreateCollector: true,
    visibleCreateCompleteModal: false,
    createLoading: false,
    collectLoading: false,
    createdCollectorId: undefined,
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});

const handleClickPrevButton = () => {
    emit('update:currentStep', 3);
};

const handleClickCreateButton = async () => {
    try {
        state.createLoading = true;
        const params: CollectorCreateParameters = {
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
            resource_group: state.isAdminMode ? RESOURCE_GROUP.DOMAIN : RESOURCE_GROUP.WORKSPACE,
        };
        const serviceAccountParams = collectorFormState.selectedServiceAccountFilterOption === 'include' ? {
            service_accounts: collectorFormState.serviceAccounts,
        } : {
            exclude_service_accounts: collectorFormState.serviceAccounts,
        };
        Object.assign(params.secret_filter ?? {}, serviceAccountParams);
        const res:CollectorModel = await SpaceConnector.clientV2.inventory.collector.create<CollectorCreateParameters, CollectorModel>(params);
        state.createdCollectorId = res?.collector_id;
        state.visibleCreateCompleteModal = true;
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_S_CREATE_COLLECTOR'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_E_CREATE_COLLECTOR'));
    } finally {
        state.createLoading = false;
    }
};

const handleClickOtherPluginButton = () => {
    state.deleteModalVisible = true;
};

const handleClose = () => {
    emit('update:currentStep', 1);
    state.deleteModalVisible = false;
};

const handleConfirmCreateCollector = async () => {
    try {
        state.collectLoading = true;
        // After the collector created, if the user clicks the collect button, the collector will be executed.
        if (state.createdCollectorId) {
            await SpaceConnector.clientV2.inventory.collector.collect<CollectorCollectParameters, JobModel>({
                collector_id: state.createdCollectorId,
            });
        } else {
            throw new Error('createdCollectorId is undefined');
        }
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_S_COLLECT_EXECUTION'), '');
        goToCollectorDetailPage();
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_E_COLLECT_EXECUTION'));
    } finally {
        state.collectLoading = false;
    }
};

const goToCollectorDetailPage = () => {
    state.visibleCreateCompleteModal = false;
    if (state.createdCollectorId) {
        router.push({
            name: appContextStore.getters.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.COLLECTOR.DETAIL._NAME : ASSET_INVENTORY_ROUTE.COLLECTOR.DETAIL._NAME,
            params: {
                collectorId: state.createdCollectorId,
            },
        }).catch(() => {});
    }
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

