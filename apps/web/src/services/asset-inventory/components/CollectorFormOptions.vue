<template>
    <div class="collector-options-form">
        <p-field-title class="additional-options-label"
                       size="lg"
                       :label="$t('INVENTORY.COLLECTOR.ADDITIONAL_OPTIONS')"
        />
        <p-data-loader class="collector-options-form-contents"
                       :loading="isLoadingPluginMetadata"
                       :data="schema"
                       loader-backdrop-color="0"
        >
            <p-json-schema-form :schema="schema"
                                :form-data="collectorFormState.options"
                                :language="state.language"
                                use-fixed-menu-style
                                reset-on-schema-change
                                uniform-width
                                @change="handleUpdateSchemaForm"
            />
            <template #no-data>
                <div v-if="pluginMetadataError"
                     class="error-box"
                >
                    <div class="error-message">
                        <p-i width="1.25rem"
                             height="1.25rem"
                             name="ic_error-filled"
                             :color="red[400]"
                        /><span>{{ $t('INVENTORY.COLLECTOR.CREATE.FORM_LOAD_FAILED') }}</span>
                    </div>
                    <p-button style-type="tertiary"
                              icon-left="ic_refresh"
                              @click="handleClickReloadButton"
                    >
                        {{ $t('INVENTORY.COLLECTOR.CREATE.RELOAD') }}
                    </p-button>
                </div>
                <div v-else
                     class="no-data-box"
                >
                    {{ $t('INVENTORY.COLLECTOR.NO_OPTIONS') }}
                </div>
            </template>
            <template #loader>
                <div class="loading-box">
                    <div class="loading-spinner">
                        <p-spinner size="xl" />
                    </div>
                    <div class="loading-description">
                        <p>{{ $t('INVENTORY.COLLECTOR.CREATE.LOADING_DESC1') }}</p>
                        <p>{{ $t('INVENTORY.COLLECTOR.CREATE.LOADING_DESC2') }}</p>
                    </div>
                </div>
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts" setup>
import {
    defineProps, computed, reactive, watch,
} from 'vue';

import { useQueryClient } from '@tanstack/vue-query';
import { isEmpty } from 'lodash';

import {
    PJsonSchemaForm, PButton, PI, PDataLoader, PFieldTitle, PSpinner,
} from '@cloudforet/mirinae';
import type { JsonSchema } from '@cloudforet/mirinae/types/controls/forms/json-schema-form/type';

import { useUserStore } from '@/store/user/user-store';

import { red } from '@/styles/colors';

import { useCollectorGetQuery } from '@/services/asset-inventory/composables/use-collector-get-query';
import { usePluginMetadataGetQuery } from '@/services/asset-inventory/composables/use-plugin-metadata-get-query';
import {
    useCollectorFormStore,
} from '@/services/asset-inventory/stores/collector-form-store';


const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.state;
const userStore = useUserStore();
const queryClient = useQueryClient();

const props = defineProps<{
    hasMetadata?: boolean; // MEMO: if true, use metadata(state.schema) of originCollectorData. And if false, call api for get metadata(state.schema).
    showTitleOnEmptySchema?: boolean;
    resetOnCollectorIdChange?: boolean;
}>();
const emit = defineEmits<{(e: 'update:isValid', isValid: boolean): void;}>();

const state = reactive({
    isSchemaEmpty: computed<boolean>(() => isEmpty(schema.value) && !pluginMetadataError.value),
    language: computed<string|undefined>(() => userStore.state.language),
});
const schema = computed<JsonSchema|object>(() => {
    if (props.hasMetadata) {
        return originCollectorData.value?.plugin_info?.metadata?.options_schema ?? {};
    }
    return pluginMetadataData.value?.metadata?.options_schema ?? {};
});

/* Query */
const { data: originCollectorData } = useCollectorGetQuery({
    collectorId: computed(() => collectorFormState.collectorId),
});
const {
    data: pluginMetadataData,
    isLoading: isLoadingPluginMetadata,
    refetch: refetchPluginMetadata,
    error: pluginMetadataError,
    key: pluginMetadataQueryKey,
} = usePluginMetadataGetQuery(computed(() => ({
    plugin_id: collectorFormState.repositoryPlugin?.plugin_id ?? '',
    version: collectorFormState.version,
    options: collectorFormState.provider ? {
        provider: collectorFormState.provider,
    } : {},
})));

const handleUpdateSchemaForm = (isValid:boolean, value) => {
    emit('update:isValid', isValid);
    collectorFormStore.setOptions(value);
};

const handleClickReloadButton = () => {
    refetchPluginMetadata();
};


/* Watcher */
watch(isLoadingPluginMetadata, (isLoading) => {
    if (!isLoading && state.isSchemaEmpty) {
        emit('update:isValid', true);
    }
});
watch(() => collectorFormState.collectorId, async (collectorId) => {
    if (props.resetOnCollectorIdChange && !collectorId) return;
    collectorFormStore.resetAttachedServiceAccount();
    queryClient.invalidateQueries({ queryKey: pluginMetadataQueryKey.value });
}, { immediate: true });

watch(pluginMetadataData, async (_data) => {
    if (!_data) return;
    collectorFormStore.setOptions(originCollectorData.value?.plugin_info?.options ?? {});
});

</script>

<style lang="postcss" scoped>

.collector-options-form {
    .additional-options-label {
        margin-bottom: 0.5rem;
    }

    .collector-options-form-contents {
        min-height: 7rem;

        @apply border rounded-xl border-gray-200;
        padding: 1rem;

        .error-box {
            @apply flex flex-col items-center justify-center w-full;

            .error-message {
                @apply flex items-center gap-2 mb-4 font-bold text-label-md text-gray-700;
            }
        }

        .no-data-box {
            @apply flex justify-center items-center;
            height: 7rem;
        }

        .loading-box {
            .loading-spinner {
                @apply flex flex-col justify-center items-center w-full;
                margin-bottom: 1rem;
            }

            .loading-description {
                @apply text-paragraph-md text-gray-500;
                text-align: center;
            }
        }
    }
}
</style>

