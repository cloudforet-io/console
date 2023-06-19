<template>
    <div class="collector-options-form">
        <p-field-title v-if="state.isVisibleTitle"
                       class="additional-options-label"
                       :label="$t('INVENTORY.COLLECTOR.ADDITIONAL_OPTIONS')"
        />
        <p-data-loader class="collector-options-form-contents"
                       :loading="state.loading"
                       :data="state.schema"
        >
            <p-json-schema-form :schema="state.schema"
                                :form-data="collectorFormState.options"
                                :language="$store.state.user.language"
                                use-fixed-menu-style
                                reset-on-schema-change
                                uniform-width
                                @change="handleUpdateSchemaForm"
            />
            <template #no-data>
                <div v-if="state.isLoadFailed"
                     class="error-box"
                >
                    <div class="error-message">
                        <p-i width="1.25rem"
                             height="1.25rem"
                             name="ic_error-filled"
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
                    <p-empty image-size="sm"
                             show-image
                    >
                        <template #image>
                            <img src="@/assets/images/illust_circle_boy.svg"
                                 alt="empty-options"
                                 class="empty-options-image"
                            >
                        </template>
                        {{ $t('INVENTORY.COLLECTOR.NO_OPTIONS') }}
                    </p-empty>
                </div>
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts" setup>
import {
    defineProps, computed, reactive, watch,
} from 'vue';

import {
    PJsonSchemaForm, PButton, PI, PDataLoader, PFieldTitle, PEmpty,
} from '@spaceone/design-system';
import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';
import { isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CollectorPluginModel } from '@/services/asset-inventory/collector/model';
import {
    useCollectorFormStore,
} from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const props = defineProps<{
    hasMetadata?: boolean; // MEMO: if true, use metadata(state.schema) of collectorFormState.originCollector. And if false, call api for get metadata(state.schema).
    showTitleOnEmptySchema?: boolean;
    resetOnCollectorIdChange?: boolean;
}>();
const emit = defineEmits<{(e: 'update:isValid', isValid: boolean): void;}>();

const state = reactive({
    isSchemaEmpty: computed<boolean>(() => isEmpty(state.schema)),
    isVisibleTitle: computed<boolean>(() => (!!props.showTitleOnEmptySchema && state.isSchemaEmpty)),
    loading: false,
    isLoadFailed: false,
    pluginId: computed<string|undefined>(() => collectorFormState.repositoryPlugin?.plugin_id),
    schema: null as null|JsonSchema|object,
});

const fetchGetPluginMetadata = (): Promise<CollectorPluginModel> => SpaceConnector.clientV2.plugin.plugin.getPluginMetadata({
    plugin_id: state.pluginId,
    version: collectorFormState.version,
    options: {
        provider: collectorFormState.provider ?? collectorFormState.repositoryPlugin?.provider,
    },
});

const getPluginMetadata = async () => {
    try {
        state.loading = true;
        state.isLoadFailed = false;
        if (!props.hasMetadata) {
            const res = await fetchGetPluginMetadata();
            state.schema = res.metadata?.options_schema ?? {};
            if (state.isSchemaEmpty) {
                emit('update:isValid', true);
            }
        } else {
            state.schema = collectorFormState.originCollector?.plugin_info?.metadata?.options_schema ?? {};
        }
    } catch (e) {
        ErrorHandler.handleError(e);
        state.schema = {};
        state.isLoadFailed = true;
        emit('update:isValid', false);
    } finally {
        state.loading = false;
    }
};

const handleUpdateSchemaForm = (isValid:boolean, value) => {
    emit('update:isValid', isValid);
    collectorFormStore.setOptions(value);
};

const handleClickReloadButton = () => {
    getPluginMetadata();
};


watch(() => collectorFormStore.collectorId, (collectorId) => {
    if (props.resetOnCollectorIdChange && !collectorId) return;
    collectorFormStore.resetAttachedServiceAccount();
    getPluginMetadata();
}, { immediate: true });

</script>

<style lang="postcss" scoped>

.collector-options-form {
    .additional-options-label {
        margin-bottom: 0.25rem;
    }

    .collector-options-form-contents {
        min-height: 6rem;

        .error-box {
            @apply flex flex-col items-center justify-center w-full;
            background-color: rgba(theme('colors.white'), 0.5);
            padding: 1.125rem;

            .error-message {
                @apply flex items-center gap-2 mb-2 text-label-md text-gray-700;
            }
        }

        .no-data-box {
            @apply flex flex-col justify-end;
            height: 10.625rem;

            .empty-options-image {
                height: 100%;
            }
        }
    }
}
</style>

