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
            <div class="version-row">
                <div class="label-row">
                    <p-field-title>{{ $t('PLUGIN.COLLECTOR.CREATE.VERSION_LABEL') }}</p-field-title>
                    <div class="auto-upgrade-wrapper">
                        <span>{{ $t('PLUGIN.COLLECTOR.CREATE.AUTO_UPGRADE_LABEL') }}</span>
                        <p-toggle-button :value="state.isAutoUpgrade"
                                         @change-toggle="handleClickAutoUpgrade"
                        />
                    </div>
                </div>
                <p-select-dropdown v-model="version"
                                   :items="state.versions"
                                   :disabled="state.isAutoUpgrade"
                                   class="w-full"
                />
            </div>
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
            <p-button :disabled="!isAllValid"
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
    PFieldTitle, PFieldGroup, PTextInput, PToggleButton, PSelectDropdown, PButton, PTextButton,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { CollectorReferenceMap } from '@/store/modules/reference/collector/type';

import TagsInputGroup from '@/common/components/forms/tags-input-group/TagsInputGroup.vue';
import type { Tag } from '@/common/components/forms/tags-input-group/type';
import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

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
    plugin: {},
    pluginId: computed(() => collectorFormState.originCollector.plugin_id),
    tags: {},
    collectors: computed<CollectorReferenceMap>(() => store.getters['reference/collectorItems']),
    collectorNames: computed(() => Object.values(state.collectors).map((item:any) => item.name)),
    versions: [] as any[], // FIXME: type
    isAutoUpgrade: false,
    isTagsValid: true,
    deleteModalVisible: false,
});

const {
    forms: {
        name,
        version,
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
    version(value: string) {
        if (value.length === 0) {
            return i18n.t('PLUGIN.COLLECTOR.CREATE.VERSION_INVALID_REQUIRED');
        }
        return '';
    },
});

const getVersions = async () => {
    try {
        state.versions = [];
        // TODO: You need to check if there are any API changes.
        const res = await SpaceConnector.client.repository.plugin.getVersions({
            plugin_id: state.pluginId,
        });
        state.versions = res.results.map((value, index) => {
            if (index === 0) return { type: 'item', label: `${value} (latest)`, name: value };
            return { type: 'item', label: value, name: value };
        });
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PLUGIN.COLLECTOR.CREATE.ALT_E_GET_VERSION_TITLE'));
    }
};

const initSelectedVersion = () => {
    setForm('version', state.versions[0].name);
};

/* event */
const handleClickAutoUpgrade = () => {
    state.isAutoUpgrade = !state.isAutoUpgrade;
};
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

(async () => {
    await Promise.allSettled([
        store.dispatch('reference/collector/load', { force: true }),
        getVersions(),
    ]);
    initSelectedVersion();
})();
</script>
<style lang="postcss" scoped>
.collector-page-2 {
    max-width: 40rem;

    .input-form {
        margin-top: 2rem;

        .version-row {
            margin: 1.5rem 0;
            .label-row {
                @apply flex justify-between;
                width: 100%;

                .auto-upgrade-wrapper {
                    @apply flex items-center gap-2;
                    span {
                        @apply text-label-sm text-gray-600;
                    }
                }
            }
        }

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
