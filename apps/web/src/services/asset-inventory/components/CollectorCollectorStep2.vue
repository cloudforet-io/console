<template>
    <div class="collector-page-2">
        <collector-plugin-contents :plugin="collectorFormState.repositoryPlugin" />
        <div class="input-form">
            <collector-name-form ref="nameInputRef"
                                 class="name-form"
                                 @update-valid="handleUpdateIsValid"
            />
            <multiple-provider-form v-if="state.providerFormVisible"
                                    class="multiple-provider-form"
                                    @update-valid="handleChangeIsProviderValid"
            />
            <collector-version-form class="version-row"
                                    get-versions-on-plugin-id-change
                                    @update-valid="handleChangeIsVersionValid"
            />
            <collector-tag-form :service-name="$t('MENU.ASSET_INVENTORY_COLLECTOR')"
                                @update-valid="handleChangeIsTagsValid"
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
            <p-button style-type="transparent"
                      class="step-left-base-button"
                      size="lg"
                      @click="handleClickPrevButton"
            >
                {{ $t('INVENTORY.COLLECTOR.CREATE.PREVIOUS') }}
            </p-button>
            <p-button :disabled="!state.isAllFormValid"
                      class="step-right-button"
                      style-type="substitutive"
                      icon-right="ic_arrow-right"
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
import {
    computed, onMounted, reactive, ref,
} from 'vue';

import {
    PButton, PTextButton,
} from '@cloudforet/mirinae';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CollectorReferenceMap } from '@/store/reference/collector-reference-store';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';

import MultipleProviderForm
    from '@/services/asset-inventory/components/CollectorCreateMultipleProviderForm.vue';
import CollectorNameForm from '@/services/asset-inventory/components/CollectorFormName.vue';
import CollectorTagForm from '@/services/asset-inventory/components/CollectorFormTag.vue';
import CollectorVersionForm from '@/services/asset-inventory/components/CollectorFormVersion.vue';
import CollectorPluginContents
    from '@/services/asset-inventory/components/CollectorPluginContents.vue';
import { useCollectorFormStore } from '@/services/asset-inventory/stores/collector-form-store';


const emit = defineEmits([
    'update:currentStep',
]);

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.state;
const allReferenceStore = useAllReferenceStore();

const state = reactive({
    loading: true,
    collectors: computed<CollectorReferenceMap>(() => allReferenceStore.getters.collector),
    collectorNames: computed(() => Object.values(state.collectors).map((item:any) => item.name)),
    isNameValid: false,
    isTagsValid: true,
    isProviderValid: false,
    isVersionValid: false,
    providerFormVisible: computed(() => !!state.supportedProviders.length),
    deleteModalVisible: false,
    isAllFormValid: computed(() => (state.isProviderValid || !state.providerFormVisible) && state.isNameValid && state.isVersionValid && state.isTagsValid),
    pluginName: computed(() => collectorFormState.repositoryPlugin?.name),
    supportedProviders: computed<string[]>(() => collectorFormState.repositoryPlugin?.capability?.supported_providers ?? []),
});
const nameInputRef = ref<null|HTMLElement>(null);

/* event */

const handleClickPrevButton = () => {
    state.deleteModalVisible = true;
};
const handleClickNextButton = () => {
    emit('update:currentStep', 3);
};
const handleClose = () => {
    emit('update:currentStep', 1);
    state.deleteModalVisible = false;
};

const handleUpdateIsValid = (isValid: boolean) => {
    state.isNameValid = isValid;
};

const handleChangeIsProviderValid = (isValid: boolean) => {
    state.isProviderValid = isValid;
};

const handleChangeIsVersionValid = (isValid: boolean) => {
    state.isVersionValid = isValid;
};

const handleChangeIsTagsValid = (isValid: boolean) => {
    state.isTagsValid = isValid;
};

onMounted(() => {
    if (nameInputRef.value) nameInputRef.value.focus();
});
</script>
<style lang="postcss" scoped>
.collector-page-2 {
    max-width: 40rem;

    .input-form {
        margin-top: 2rem;

        .name-form {
            margin-bottom: 1.5rem;
        }

        .multiple-provider-form {
            margin-bottom: 1.5rem;
        }
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
