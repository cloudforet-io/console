<template>
    <div class="collector-page-2">
        <collect-plugin-contents :plugin="collectorFormState.repositoryPlugin" />
        <div class="input-form">
            <collector-name-form @update:isValid="handleUpdateIsValid" />
            <collector-version-form class="version-row"
                                    @update:isVersionValid="handleChangeIsVersionValid"
            />
            <collector-tag-form :service-name="state.pluginName"
                                @update:isTagsValid="handleChangeIsTagsValid"
            />
        </div>
        <div class="step-footer">
            <p-text-button icon-left="ic_chevron-left"
                           style-type="highlight"
                           class="step-left-text-button"
                           @click="handleClickPrevButton"
            >
                {{ $t('INVENTORY.COLLECTOR.CREATE.SELECT_OTHER_PLUGIN') }}
            </p-text-button>
            <p-button icon-left="ic_arrow-left"
                      style-type="transparent"
                      class="step-left-base-button"
                      size="lg"
                      @click="handleClickPrevButton"
            >
                {{ $t('INVENTORY.COLLECTOR.CREATE.PREVIOUS') }}
            </p-button>
            <p-button :disabled="!state.isAllFormValid"
                      class="step-right-button"
                      size="lg"
                      @click="handleClickNextButton"
            >
                {{ $t('INVENTORY.COLLECTOR.CREATE.CONTINUE') }}
            </p-button>
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


import { store } from '@/store';

import type { CollectorReferenceMap } from '@/store/modules/reference/collector/type';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';

import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
import CollectorNameForm from '@/services/asset-inventory/collector/shared/collector-forms/CollectorNameForm.vue';
import CollectorTagForm from '@/services/asset-inventory/collector/shared/collector-forms/CollectorTagForm.vue';
import CollectorVersionForm from '@/services/asset-inventory/collector/shared/collector-forms/CollectorVersionForm.vue';
import CollectPluginContents
    from '@/services/asset-inventory/collector/shared/CollectorPluginContents.vue';


const emit = defineEmits([
    'update:currentStep',
]);

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const state = reactive({
    loading: true,
    collectors: computed<CollectorReferenceMap>(() => store.getters['reference/collectorItems']),
    collectorNames: computed(() => Object.values(state.collectors).map((item:any) => item.name)),
    isNameValid: false,
    isTagsValid: true,
    isVersionValid: false,
    deleteModalVisible: false,
    isAllFormValid: computed(() => state.isNameValid && state.isVersionValid && state.isTagsValid),
    pluginName: computed(() => collectorFormState.repositoryPlugin?.name),
});

/* event */

const handleClickPrevButton = () => {
    state.deleteModalVisible = true;
};
const handleClickNextButton = () => {
    emit('update:currentStep', 3);
};
const handleClose = () => {
    emit('update:currentStep', 1);
};

const handleUpdateIsValid = (isValid: boolean) => {
    state.isNameValid = isValid;
};

const handleChangeIsVersionValid = (isValid: boolean) => {
    state.isVersionValid = isValid;
};

const handleChangeIsTagsValid = (isValid: boolean) => {
    state.isTagsValid = isValid;
};

(async () => {
    await store.dispatch('reference/collector/load', { force: true });
})();
</script>
<style lang="postcss" scoped>
.collector-page-2 {
    max-width: 40rem;

    .input-form {
        margin-top: 2rem;
    }

    .step-footer {
        @apply flex justify-between items-center;
        margin-top: 2rem;

        .step-left-base-button {
            display: none;
        }
    }
}

@screen tablet {
    .collector-page-2 {
        min-width: 43rem;
    }
}

@screen mobile {
    .collector-page-2 {
        min-width: unset;
        max-width: 100vw;

        .step-footer {
            @apply flex justify-between items-center;
            margin-top: 2rem;

            .step-left-base-button {
                display: unset;
            }

            .step-left-text-button {
                display: none;
            }
        }
    }
}
</style>
