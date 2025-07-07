<template>
    <div class="collector-version-form">
        <div class="label-row">
            <p-field-title>{{ $t('INVENTORY.COLLECTOR.CREATE.VERSION_LABEL') }}</p-field-title>
            <p-field-title font-weight="regular"
                           size="sm"
                           color="gray"
                           :label="$t('INVENTORY.COLLECTOR.CREATE.AUTO_UPGRADE_LABEL')"
            >
                <template #right>
                    <p-toggle-button :value="collectorFormState.autoUpgrade"
                                     @change-toggle="handleClickAutoUpgrade"
                    />
                </template>
            </p-field-title>
        </div>
        <p-select-dropdown :selected="collectorFormState.version"
                           :menu="state.versionItems"
                           :disabled="collectorFormState.autoUpgrade"
                           class="w-full"
                           @update:selected="handleChangeVersion"
        />
        <div v-show="state.isVersionValid && !collectorFormState.autoUpgrade"
             class="invalid-feedback"
        >
            {{ state.versionInvalidText }}
        </div>
    </div>
</template>

<script lang="ts" setup>

import { computed, reactive, watch } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PFieldTitle, PToggleButton, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { i18n } from '@/translations';

import { useCollectorGetQuery } from '@/services/asset-inventory/composables/use-collector-get-query';
import { usePluginGetVersionsQuery } from '@/services/asset-inventory/composables/use-plugin-get-versions-query';
import { useCollectorFormStore } from '@/services/asset-inventory/stores/collector-form-store';

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.state;

const emit = defineEmits<{(event: 'update-valid', value: boolean): void;
}>();

const state = reactive({
    versionItems: computed<MenuItem[]>(() => pluginVersionsData.value?.map((value, index) => {
        if (index === 0) return { type: 'item', label: `${value} (latest)`, name: value };
        return { type: 'item', label: value, name: value };
    }) || []),
    versionInvalidText: computed<TranslateResult>(() => {
        const value = collectorFormState.version;
        if (!value?.length) {
            return i18n.t('INVENTORY.COLLECTOR.CREATE.VERSION_INVALID_REQUIRED');
        }
        return '';
    }),
    isVersionValid: computed(() => !state.versionInvalidText || collectorFormState.autoUpgrade),
});
const collectorPluginId = computed<string|undefined>(() => originCollectorData.value?.plugin_info?.plugin_id ?? collectorFormState.repositoryPlugin?.plugin_id);

/* Query */
const { data: originCollectorData } = useCollectorGetQuery({
    collectorId: computed(() => collectorFormState.collectorId),
});
const { data: pluginVersionsData, isLoading: isLoadingPluginVersions } = usePluginGetVersionsQuery({
    pluginId: computed(() => collectorPluginId.value ?? ''),
});

const initSelectedVersion = () => {
    if (originCollectorData.value) {
        const originAutoUpgrade = originCollectorData.value?.plugin_info?.upgrade_mode === 'AUTO';
        const originVersion = originCollectorData.value?.plugin_info?.version;
        collectorFormStore.$patch((_state) => {
            _state.state.version = originVersion ?? pluginVersionsData.value?.[0] ?? '';
            _state.state.autoUpgrade = originAutoUpgrade ?? true;
        });
    } else {
        collectorFormStore.$patch((_state) => {
            _state.state.version = pluginVersionsData.value?.[0] ?? '';
            _state.state.autoUpgrade = true;
        });
    }
};

/* event */
const handleChangeVersion = (value: string) => {
    collectorFormStore.setVersion(value);
};

const handleClickAutoUpgrade = () => {
    collectorFormStore.setAutoUpgrade(!collectorFormState.autoUpgrade);
    if (collectorFormState.autoUpgrade) {
        collectorFormStore.setVersion(pluginVersionsData.value?.[0] ?? '');
    }
};

watch(() => state.isVersionValid, (value) => {
    emit('update-valid', value);
}, { immediate: true });

// get version list when pluginId changed and init selected version
watch([() => collectorPluginId.value, () => isLoadingPluginVersions.value], async ([pluginId, isLoading]) => {
    if (!pluginId || isLoading) return;
    initSelectedVersion();
}, { immediate: true });
</script>

<style lang="postcss" scoped>
.collector-version-form {
    margin: 1.5rem 0;
    max-width: 728px;

    .label-row {
        @apply flex justify-between;
        width: 100%;
        margin-bottom: 0.25rem;
    }

    .invalid-feedback {
        @apply text-alert;
        font-size: 0.75rem;
        line-height: 0.875rem;
        margin-top: 0.25rem;
    }
}

</style>
