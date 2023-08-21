<template>
    <div class="collector-page-3">
        <div class="input-form">
            <attached-service-account-form @update:isAttachedServiceAccountValid="handleChangeIsAttachedServiceAccountValid" />
            <collector-options-form class="collector-options-form"
                                    show-title-on-empty-schema
                                    @update:isValid="handleChangeIsSchemaFormValid"
            />
        </div>
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
                <p-button :disabled="!state.isAllFormValid"
                          size="lg"
                          @click="handleClickNextButton"
                >
                    {{ $t('INVENTORY.COLLECTOR.CREATE.CONTINUE') }}
                </p-button>
            </div>
        </div>
        <delete-modal :header-title="$t('INVENTORY.COLLECTOR.CREATE.PREV_MODAL_TITLE')"
                      :visible.sync="state.deleteModalVisible"
                      :contents="$t('INVENTORY.COLLECTOR.CREATE.PREV_MODAL_CONTENT')"
                      @confirm="handleClose"
        />
    </div>
</template>

<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PButton, PTextButton,
} from '@spaceone/design-system';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';

import AttachedServiceAccountForm
    from '@/services/asset-inventory/collector/shared/collector-forms/AttachedServiceAccountForm.vue';
import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
import CollectorOptionsForm from '@/services/asset-inventory/collector/shared/collector-forms/CollectorOptionsForm.vue';


const emit = defineEmits([
    'update:currentStep',
]);

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;


const state = reactive({
    loading: true,
    pluginId: computed<string|undefined>(() => collectorFormState.repositoryPlugin?.plugin_id),
    deleteModalVisible: false,
    isAttachedServiceAccountValid: false,
    isSchemaFormValid: false,
    isAllFormValid: computed<boolean>(() => state.isAttachedServiceAccountValid && state.isSchemaFormValid),
});

/* event */

const handleChangeIsAttachedServiceAccountValid = (isValid: boolean) => {
    state.isAttachedServiceAccountValid = isValid;
};

const handleChangeIsSchemaFormValid = (isValid: boolean) => {
    state.isSchemaFormValid = isValid;
};

const handleClickOtherPluginButton = () => {
    state.deleteModalVisible = true;
};
const handleClickNextButton = () => {
    emit('update:currentStep', 4);
};
const handleClickPrevButton = () => {
    emit('update:currentStep', 2);
};

const handleClose = () => {
    emit('update:currentStep', 1);
};


</script>
<style lang="postcss" scoped>
.collector-page-3 {
    min-width: 40rem;

    .input-form {
        .collector-options-form {
            margin-top: 2rem;
        }
    }

    .step-footer {
        @apply flex justify-between items-center;
        margin-top: 2rem;

        .right-area {
            @apply flex items-center;
            :first-child {
                margin-right: 1rem;
            }
        }
    }
}

@screen mobile {
    .collector-page-3 {
        min-width: unset;
        max-width: 100vw;

        .input-form {
            min-height: unset;
        }

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
