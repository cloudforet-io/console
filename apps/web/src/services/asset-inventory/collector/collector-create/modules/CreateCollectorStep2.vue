<template>
    <div class="collector-page-2">
        <collector-plugin-contents :plugin="collectorFormState.repositoryPlugin" />
        <div class="input-form">
            <collector-name-form ref="nameInputRef"
                                 class="name-form"
                                 @update:is-valid="handleUpdateIsValid"
            />
            <multiple-provider-form v-if="state.supportedProviders.length"
                                    class="multiple-provider-form"
            />
            <collector-version-form class="version-row"
                                    get-versions-on-plugin-id-change
                                    @update:is-version-valid="handleChangeIsVersionValid"
            />
            <collector-tag-form :service-name="t('MENU.ASSET_INVENTORY_COLLECTOR')"
                                @update:is-tags-valid="handleChangeIsTagsValid"
            />
        </div>
        <div class="step-footer">
            <p-text-button icon-left="ic_chevron-left"
                           style-type="highlight"
                           class="step-left-text-button"
                           @click="handleClickPrevButton"
            >
                {{ t('INVENTORY.COLLECTOR.CREATE.SELECT_OTHER_PLUGIN') }}
            </p-text-button>
            <p-button icon-left="ic_arrow-left"
                      style-type="transparent"
                      class="step-left-base-button"
                      size="lg"
                      @click="handleClickPrevButton"
            >
                {{ t('INVENTORY.COLLECTOR.CREATE.PREVIOUS') }}
            </p-button>
            <p-button :disabled="!state.isAllFormValid"
                      class="step-right-button"
                      size="lg"
                      @click="handleClickNextButton"
            >
                {{ t('INVENTORY.COLLECTOR.CREATE.CONTINUE') }}
            </p-button>
        </div>
        <delete-modal v-model:visible="state.deleteModalVisible"
                      :header-title="t('INVENTORY.COLLECTOR.CREATE.PREV_MODAL_TITLE')"
                      :contents="t('INVENTORY.COLLECTOR.CREATE.PREV_MODAL_CONTENT')"
                      @confirm="handleClose"
        />
    </div>
</template>

<script lang="ts" setup>
import {
    PButton, PTextButton,
} from '@spaceone/design-system';
import {
    computed, onMounted, reactive, ref,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { CollectorReferenceMap } from '@/store/modules/reference/collector/type';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';

import MultipleProviderForm
    from '@/services/asset-inventory/collector/collector-create/modules/MultipleProviderForm.vue';
import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
import CollectorNameForm from '@/services/asset-inventory/collector/shared/collector-forms/CollectorNameForm.vue';
import CollectorTagForm from '@/services/asset-inventory/collector/shared/collector-forms/CollectorTagForm.vue';
import CollectorVersionForm from '@/services/asset-inventory/collector/shared/collector-forms/CollectorVersionForm.vue';
import CollectorPluginContents
    from '@/services/asset-inventory/collector/shared/CollectorPluginContents.vue';



const emit = defineEmits<{(e: 'update:current-step', value: number): void}>();
const store = useStore();
const { t } = useI18n();

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
    supportedProviders: computed<string[]>(() => collectorFormState.repositoryPlugin?.capability?.supported_providers ?? []),
});
const nameInputRef = ref<null|HTMLElement>(null);

/* event */

const handleClickPrevButton = () => {
    state.deleteModalVisible = true;
};
const handleClickNextButton = () => {
    emit('update:current-step', 3);
};
const handleClose = () => {
    emit('update:current-step', 1);
    state.deleteModalVisible = false;
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

onMounted(() => {
    if (nameInputRef.value) nameInputRef.value.focus();
});

(async () => {
    await store.dispatch('reference/collector/load', { force: true });
})();
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
