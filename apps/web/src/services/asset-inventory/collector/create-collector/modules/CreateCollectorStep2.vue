<template>
    <div class="collector-page-2">
        <collect-plugin-contents :plugin="collectorFormState.originCollector" />
        <div class="input-form">
            <p-field-group :label="$t('PLUGIN.COLLECTOR.CREATE.NAME_LABEL')"
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
            <!--            TODO: translation-->
            <p-field-group :label="$t('Tag')">
                <template #label-extra>
                    <div class="mt-1">
                        <!-- TODO: translation -->
                        <p class="tag-description">
                            {{ $t("Set Account's tag.") }}
                        </p>
                        <p class="tag-description">
                            {{ $t("The Key - Value pair is a required field. Only underscores (_), characters, and numbers are allowed. International characters are allowed.") }}
                        </p>
                    </div>
                </template>
                <tags-input-group :tags="state.tags"
                                  show-validation
                                  :is-valid.sync="state.isTagsValid"
                                  @update-tags="handleUpdateTags"
                />
            </p-field-group>
        </div>
        <div class="step-footer">
            <p-text-button icon-left="ic_chevron-left"
                           style-type="highlight"
                           class="step-left-text-button"
                           @click="handleClickPrevButton"
            >
                <!--                TODO: translation-->
                {{ $t('Select Other Plugin') }}
            </p-text-button>
            <p-button icon-left="ic_arrow-left"
                      style-type="transparent"
                      class="step-left-base-button"
                      size="lg"
                      @click="handleClickPrevButton"
            >
                <!--                TODO: translation-->
                {{ $t('Previous') }}
            </p-button>
            <p-button :disabled="!state.isAllFormValid"
                      class="step-right-button"
                      size="lg"
                      @click="handleClickNextButton"
            >
                <!--                TODO: translation-->
                {{ $t('Continue') }}
            </p-button>
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
    PFieldGroup, PTextInput, PButton, PTextButton,
} from '@spaceone/design-system';


import { store } from '@/store';
import { i18n } from '@/translations';

import type { CollectorReferenceMap } from '@/store/modules/reference/collector/type';

import TagsInputGroup from '@/common/components/forms/tags-input-group/TagsInputGroup.vue';
import type { Tag } from '@/common/components/forms/tags-input-group/type';
import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import { useFormValidator } from '@/common/composables/form-validator';

import CollectorVersionForm from '@/services/asset-inventory/collector/modules/CollectorVersionForm.vue';
import CollectPluginContents
    from '@/services/asset-inventory/collector/modules/CollectPluginContents.vue';
import { useCollectorFormStore } from '@/services/asset-inventory/store/collector-form-store';


const emit = defineEmits([
    'update:currentStep',
]);

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const state = reactive({
    loading: true,
    tags: {},
    collectors: computed<CollectorReferenceMap>(() => store.getters['reference/collectorItems']),
    collectorNames: computed(() => Object.values(state.collectors).map((item:any) => item.name)),
    isTagsValid: true,
    isVersionValid: false,
    deleteModalVisible: false,
    isAllFormValid: computed(() => isAllValid.value && state.isVersionValid),
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
    name: '',
    version: '',
}, {
    name(value: string) {
        if (value.length < 2) {
            return i18n.t('PLUGIN.COLLECTOR.CREATE.NAME_INVALID_MIN');
        } if (state.collectorNames.includes(value)) {
            return i18n.t('PLUGIN.COLLECTOR.CREATE.NAME_INVALID_DUPLICATED');
        }
        return '';
    },
});


/* event */
const handleUpdateTags = (tags: Tag) => {
    state.tags = tags;
};

const handleClickPrevButton = () => {
    state.deleteModalVisible = true;
};
const handleClickNextButton = () => {
    emit('update:currentStep', 3);
};
const handleClose = () => {
    emit('update:currentStep', 1);
};

const handleChangeIsVersionValid = (isValid: boolean) => {
    state.isVersionValid = isValid;
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
        .tag-description {
            @apply text-label-md text-gray-900;
            font-weight: 400;
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
