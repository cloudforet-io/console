<template>
    <p-data-loader class="plugin-metadata-form"
                   :loading="state.loading"
    >
        <p-json-schema-form v-if="!state.isLoadFailed && !state.loading"
                            :schema="state.schema"
                            :form-data="collectorFormState.pluginMetadata"
                            validation-mode="all"
                            :language="$store.state.user.language"
                            uniform-width
                            @change="handleUpdateSchemaForm"
        />
        <div v-else
             class="error-box"
        >
            <div class="error-message">
                <p-i name="ic_error-filled" /><span>{{ $t('INVENTORY.COLLECTOR.CREATE.FORM_LOAD_FAILED') }}</span>
            </div>
            <p-button style-type="tertiary"
                      icon-left="ic_refresh"
                      @click="handleClickReloadButton"
            >
                {{ $t('INVENTORY.COLLECTOR.CREATE.RELOAD') }}
            </p-button>
        </div>
    </p-data-loader>
</template>

<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PJsonSchemaForm, PButton, PI, PDataLoader,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    useCollectorFormStore,
} from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const emit = defineEmits<{(e: 'change:isSchemaFormValid', isValid: boolean): void;}>();

const state = reactive({
    loading: true,
    pluginId: computed<string|undefined>(() => collectorFormState.repositoryPlugin?.plugin_id),
    schema: null as null|object,
    isLoadFailed: false,
});

const getPluginMetadata = async () => {
    try {
        state.loading = true;
        const res = await SpaceConnector.clientV2.plugin.plugin.getPluginMetadata({
            plugin_id: state.pluginId,
            version: collectorFormState.version,
        });
        state.schema = res.metadata?.options_schema;
    } catch (e) {
        state.isLoadFailed = true;
        ErrorHandler.handleError(e);
        state.schema = null;
    } finally {
        state.loading = false;
    }
};

const handleUpdateSchemaForm = (isValid:boolean, value) => {
    emit('change:isSchemaFormValid', isValid);
    collectorFormStore.setPluginMetadata(value);
};

const handleClickReloadButton = () => {
    state.isLoadFailed = false;
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
        @apply flex flex-col items-center justify-center;
        background-color: rgba(theme('colors.white'), 0.5);
        padding: 1.125rem;

        .error-message {
            @apply flex items-center gap-2 mb-2;
        }
    }
}
</style>

