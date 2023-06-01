<template>
    <div class="collector-page-4">
        <collector-schedule-form edit-mode />
        <div class="step-footer">
            <p-text-button icon-left="ic_chevron-left"
                           style-type="highlight"
                           class="step-left-text-button"
                           @click="handleClickOtherPluginButton"
            >
                <!--                TODO: translation-->
                {{ $t('Select Other Plugin') }}
            </p-text-button>
            <div class="right-area">
                <p-button icon-left="ic_arrow-left"
                          style-type="transparent"
                          size="lg"
                          @click="handleClickPrevButton"
                >
                    <!--                TODO: translation-->
                    {{ $t('Previous') }}
                </p-button>
                <p-button :disabled="!state.isAbleToCreateCollector"
                          size="lg"
                          @click="handleClickCreateButton"
                >
                    <!--                TODO: translation-->
                    {{ $t('Create New Collector') }}
                </p-button>
            </div>
        </div>
        <!--        TODO: translation-->
        <delete-modal :header-title="$t('Are you sure you want to start from selecting plugin?')"
                      :visible.sync="state.deleteModalVisible"
                      :contents="$t('You cannot undo this action.')"
                      size="sm"
                      @confirm="handleClose"
        />
        <p-button-modal :visible.sync="state.visibleCreateModal"
                        :header-title="$t('Do you want to collect data now?')"
                        @confirm="handleConfirmCreateCollector"
                        @cancel="handleRouteToCollectorList"
        >
            <template #close-button>
                <!--        TODO: translation-->
                {{ $t('Skip for Later') }}
            </template>
            <template #confirm-button>
                <!--        TODO: translation-->
                {{ $t('Collect Now') }}
            </template>
        </p-button-modal>
    </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';

import {
    PButton, PTextButton, PButtonModal,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import CollectorScheduleForm from '@/services/asset-inventory/collector/modules/CollectorScheduleForm.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

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

const handleClickCreateButton = async () => {
    try {
        state.loading = true;
        // TODO: create api call
    } catch (e) {
        // TODO: translation
        ErrorHandler.handleRequestError(e, i18n.t('Failed to create collector'));
    } finally {
        state.loading = false;
        state.visibleCreateModal = true;
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

