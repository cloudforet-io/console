<template>
    <div class="collector-page-3">
        <div class="input-form">
            <attached-service-account-form @update:isAttachedServiceAccountValid="handleChangeIsAttachedServiceAccountValid" />
            <!--TODO: "json-schema" will be added-->
        </div>
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
                <p-button :disabled="!state.isAttachedServiceAccountValid"
                          size="lg"
                          @click="handleClickNextButton"
                >
                    <!--                TODO: translation-->
                    {{ $t('Continue') }}
                </p-button>
            </div>
        </div>
        <!--        TODO: translation-->
        <delete-modal :header-title="$t('Are you sure you want to start from selecting plugin?')"
                      :visible.sync="state.deleteModalVisible"
                      :contents="$t('You cannot undo this action.')"
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
    from '@/services/asset-inventory/collector/create-collector/modules/AttachedServiceAccountForm.vue';
import { useCollectorFormStore } from '@/services/asset-inventory/store/collector-form-store';


const emit = defineEmits([
    'update:currentStep',
]);

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;


const state = reactive({
    loading: true,
    pluginId: computed(() => collectorFormState.originCollector.plugin_id),
    deleteModalVisible: false,
    isAttachedServiceAccountValid: false,
});

/* event */

const handleChangeIsAttachedServiceAccountValid = (isValid: boolean) => {
    state.isAttachedServiceAccountValid = isValid;
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

(() => {
})();
</script>
<style lang="postcss" scoped>
.collector-page-3 {
    min-width: 40rem;

    .input-form {
        margin-top: 2rem;
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
