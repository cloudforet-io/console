<template>
    <div class="collector-page-2">
        <collect-plugin-contents :plugin="collectorFormState.pluginInfo" />
        <div class="input-form">
            <p-field-group :label="$t('INVENTORY.COLLECTOR.CREATE.NAME')"
                           :invalid-text="invalidTexts.name"
                           :invalid="invalidState.name"
                           :required="true"
            >
                <template #default="{invalid}">
                    <p-text-input :value="name"
                                  class="block"
                                  :invalid="invalid"
                                  @update:value="setForm('name', $event)"
                    />
                </template>
            </p-field-group>
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
    PFieldGroup, PTextInput, PButton, PTextButton,
} from '@spaceone/design-system';


import { store } from '@/store';
import { i18n } from '@/translations';

import type { CollectorReferenceMap } from '@/store/modules/reference/collector/type';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import { useFormValidator } from '@/common/composables/form-validator';

import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
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
    isTagsValid: true,
    isVersionValid: false,
    deleteModalVisible: false,
    isAllFormValid: computed(() => isAllValid.value && state.isVersionValid && state.isTagsValid),
    pluginName: computed(() => collectorFormState.pluginInfo?.name),
});

const {
    forms: {
        name,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    name: collectorFormState.name,
    version: collectorFormState.version,
}, {
    name(value: string) {
        if (value.length < 2) {
            return i18n.t('INVENTORY.COLLECTOR.CREATE.NAME_INVALID_MIN');
        } if (state.collectorNames.includes(value)) {
            return i18n.t('INVENTORY.COLLECTOR.CREATE.NAME_INVALID_DUPLICATED');
        }
        return '';
    },
});


/* event */

const handleClickPrevButton = () => {
    state.deleteModalVisible = true;
};
const handleClickNextButton = () => {
    collectorFormStore.setName(name.value);
    emit('update:currentStep', 3);
};
const handleClose = () => {
    emit('update:currentStep', 1);
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
