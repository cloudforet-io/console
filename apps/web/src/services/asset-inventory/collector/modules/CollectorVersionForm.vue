<template>
    <div class="collector-version-form">
        <div class="label-row">
            <p-field-title>{{ $t('PLUGIN.COLLECTOR.CREATE.VERSION_LABEL') }}</p-field-title>
            <div class="auto-upgrade-wrapper">
                <span>{{ $t('PLUGIN.COLLECTOR.CREATE.AUTO_UPGRADE_LABEL') }}</span>
                <p-toggle-button :value="state.isAutoUpgrade"
                                 @change-toggle="handleClickAutoUpgrade"
                />
            </div>
        </div>
        <p-select-dropdown :selected="version"
                           :items="state.versions"
                           :disabled="state.isAutoUpgrade"
                           class="w-full"
                           @update:selected="setForm('version', $event)"
        />
        <div v-show="invalidState.version && !state.isAutoUpgrade"
             class="invalid-feedback"
        >
            {{ invalidTexts.version }}
        </div>
    </div>
</template>

<script lang="ts" setup>

import { computed, reactive, watch } from 'vue';

import {
    PFieldTitle, PToggleButton, PSelectDropdown,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useCollectorFormStore } from '@/services/asset-inventory/store/collector-form-store';

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const emit = defineEmits<{(event: 'update:isVersionValid', value: boolean): void;
}>();

const {
    forms: {
        version,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    version: '',
}, {
    version(value: string|undefined) {
        if (!value?.length) {
            return i18n.t('PLUGIN.COLLECTOR.CREATE.VERSION_INVALID_REQUIRED');
        }
        return '';
    },
});

const state = reactive({
    pluginId: computed<string|undefined>(() => collectorFormState.pluginInfo?.plugin_id),
    isAutoUpgrade: false,
    versions: [] as any[], // FIXME: type
});

const getVersions = async (pluginId: string) => {
    try {
        state.versions = [];
        // TODO: You need to check if there are any API changes.
        const res = await SpaceConnector.client.repository.plugin.getVersions({
            plugin_id: pluginId,
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
    setForm('version', state.versions[0]?.name);
};

/* event */
const handleClickAutoUpgrade = () => {
    state.isAutoUpgrade = !state.isAutoUpgrade;
};

watch(isAllValid, (value) => {
    emit('update:isVersionValid', value);
}, { immediate: true });

// get version list when pluginId changed and init selected version
watch(() => state.pluginId, async (pluginId) => {
    if (!pluginId) return;
    await Promise.allSettled([
        getVersions(pluginId),
    ]);
    initSelectedVersion();
}, { immediate: true });
</script>

<style lang="postcss" scoped>
.collector-version-form {
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

    .invalid-feedback {
        @apply text-alert;
        font-size: 0.75rem;
        line-height: 0.875rem;
        margin-top: 0.25rem;
    }
}

</style>
