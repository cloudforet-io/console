<template>
    <p-data-loader class="plugin-metadata-form"
                   :loading="state.loading"
                   :data="state.schema"
    >
        <p-json-schema-form :schema="state.schema"
                            :form-data="collectorFormState.pluginMetadata"
                            validation-mode="all"
                            :language="$store.state.user.language"
                            uniform-width
                            @change="handleUpdateSchemaForm"
        />
        <template #no-data>
            <div class="error-box">
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
        </template>
    </p-data-loader>
</template>

<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PJsonSchemaForm, PButton, PI, PDataLoader,
} from '@spaceone/design-system';
import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    useCollectorFormStore,
} from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const emit = defineEmits<{(e: 'update:isValid', isValid: boolean): void;}>();

const state = reactive({
    loading: true,
    pluginId: computed<string|undefined>(() => collectorFormState.repositoryPlugin?.plugin_id),
    schema: null as null|JsonSchema|object,
});

const getPluginMetadata = async () => {
    try {
        state.loading = true;
        const res = await SpaceConnector.clientV2.plugin.plugin.getPluginMetadata({
            plugin_id: state.pluginId,
            version: collectorFormState.version,
        });
        state.schema = res.metadata?.options_schema ?? null;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.schema = {};
    } finally {
        state.loading = false;
    }
};

const handleUpdateSchemaForm = (isValid:boolean, value) => {
    emit('update:isValid', isValid);
    collectorFormStore.setPluginMetadata(value);
};

const handleClickReloadButton = () => {
    getPluginMetadata();
};

(() => {
    getPluginMetadata();
})();
</script>

<style lang="postcss" scoped>
.plugin-metadata-form {
    min-height: 6rem;

    .error-box {
        @apply flex flex-col items-center justify-center w-full;
        background-color: rgba(theme('colors.white'), 0.5);
        padding: 1.125rem;

        .error-message {
            @apply flex items-center gap-2 mb-2 text-label-md text-gray-700;
        }
    }
}
</style>

