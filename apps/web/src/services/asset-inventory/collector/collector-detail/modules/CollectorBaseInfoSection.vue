<template>
    <p-pane-layout>
        <p-heading :title="$t('INVENTORY.COLLECTOR.DETAIL.BASE_INFO')"
                   heading-type="sub"
        >
            <template #extra>
                <p-button v-if="!state.isEditMode"
                          size="md"
                          icon-left="ic_edit"
                          style-type="secondary"
                          @click="handleClickEdit"
                >
                    {{ $t('INVENTORY.COLLECTOR.DETAIL.EDIT') }}
                </p-button>
            </template>
        </p-heading>

        <p-definition-table v-if="!state.isEditMode"
                            :fields="fields"
                            :loading="props.loading"
                            :data="collectorFormState.originCollector"
                            style-type="white"
        >
            <template #data-pluginName>
                <p-lazy-img :src="state.pluginIcon"
                            :loading="props.loading"
                            width="1rem"
                            height="1rem"
                />
                <span class="ml-2 leading-none">{{ state.pluginName }}</span>
            </template>
            <template #data-plugin_info.version="{ value }">
                {{ value }} {{ isLatestVersion(value) ? ' (latest)' : '' }}
            </template>
            <template #data-plugin_info.upgrade_mode="{ value }">
                {{ value === UPGRADE_MODE.AUTO ? 'ON' : 'OFF' }}
            </template>
            <template #data-created_at="{ value }">
                {{ value ? iso8601Formatter(value, timezone) : '' }}
            </template>
            <template #data-last_collected_at="{ value }">
                {{ value ? iso8601Formatter(value, timezone) : '' }}
            </template>
        </p-definition-table>

        <div v-if="state.isEditMode"
             class="collector-base-info-edit"
        >
            <collector-plugin-contents :plugin="state.pluginInfo" />
            <collector-version-form @update:isVersionValid="handleUpdateIsVersionValid" />
            <collector-tag-form :service-name="$t('MENU.ASSET_INVENTORY_COLLECTOR')"
                                @update:isTagsValid="handleUpdateIsTagsValid"
            />
            <p-button style-type="tertiary"
                      size="lg"
                      :disabled="state.updateLoading"
                      @click="handleClickCancel"
            >
                {{ $t('INVENTORY.COLLECTOR.DETAIL.CANCEL') }}
            </p-button>
            <p-button style-type="primary"
                      size="lg"
                      class="save-changes-button"
                      :disabled="!state.isAllValid"
                      :loading="state.updateLoading"
                      @click="handleClickSave"
            >
                {{ $t('INVENTORY.COLLECTOR.DETAIL.SAVE_CHANGES') }}
            </p-button>
        </div>
    </p-pane-layout>
</template>

<script lang="ts" setup>
import {
    defineProps, computed, reactive,
} from 'vue';

import {
    PHeading, PButton, PPaneLayout, PDefinitionTable, PLazyImg,
} from '@spaceone/design-system';
import type { DefinitionField } from '@spaceone/design-system/types/data-display/tables/definition-table/type';

import { iso8601Formatter } from '@cloudforet/core-lib/index';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { PluginReferenceItem, PluginReferenceMap } from '@/store/modules/reference/plugin/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type {
    CollectorModel, CollectorPluginModel, CollectorUpdateParameter, CollectorUpdatePluginParameter,
} from '@/services/asset-inventory/collector/model';
import { UPGRADE_MODE } from '@/services/asset-inventory/collector/model';
import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
import CollectorTagForm from '@/services/asset-inventory/collector/shared/collector-forms/CollectorTagForm.vue';
import CollectorVersionForm from '@/services/asset-inventory/collector/shared/collector-forms/CollectorVersionForm.vue';
import CollectorPluginContents from '@/services/asset-inventory/collector/shared/CollectorPluginContents.vue';

const props = defineProps<{
    loading: boolean;
}>();

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const timezone = computed<string>(() => store.state.user.timezone);
const fields = computed<DefinitionField[]>(() => [
    { name: 'pluginName', label: i18n.t('INVENTORY.COLLECTOR.DETAIL.PLUGIN') },
    { name: 'plugin_info.plugin_id', label: i18n.t('INVENTORY.COLLECTOR.DETAIL.PLUGIN_ID') },
    { name: 'plugin_info.version', label: i18n.t('INVENTORY.COLLECTOR.DETAIL.VERSION') },
    { name: 'tags', label: i18n.t('INVENTORY.COLLECTOR.DETAIL.TAG') },
    { name: 'plugin_info.upgrade_mode', label: i18n.t('INVENTORY.COLLECTOR.DETAIL.AUTO_UPGRADE') },
    { name: 'last_collected_at', label: i18n.t('INVENTORY.COLLECTOR.DETAIL.LAST_COLLECTED') },
    { name: 'created_at', label: i18n.t('INVENTORY.COLLECTOR.DETAIL.CREATED') },
]);

const state = reactive({
    plugins: computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']),
    pluginItem: computed<PluginReferenceItem|undefined>(() => {
        if (!state.pluginInfo) return undefined;
        return state.plugins[state.pluginInfo.plugin_id];
    }),
    pluginInfo: computed<CollectorPluginModel|null>(() => collectorFormState.originCollector?.plugin_info ?? null),
    pluginName: computed<string>(() => state.pluginItem?.label ?? ''),
    pluginIcon: computed<string>(() => state.pluginItem?.icon ?? ''),
    isEditMode: false,
    isVersionValid: false,
    isTagsValid: false,
    isPluginUpdated: computed<boolean>(() => {
        if (!state.pluginInfo) return false;
        return state.pluginInfo.version !== collectorFormState.version
            || (state.pluginInfo.upgrade_mode === UPGRADE_MODE.AUTO) !== collectorFormState.autoUpgrade;
    }),
    isTagsUpdated: computed<boolean>(() => {
        if (!collectorFormState.originCollector) return false;
        return JSON.stringify(collectorFormState.originCollector.tags) !== JSON.stringify(collectorFormState.tags);
    }),
    isAllValid: computed(() => (state.isPluginUpdated || state.isTagsUpdated) && state.isVersionValid && state.isTagsValid),
    updateLoading: false,
});

// TODO: Implement isLatestVersion
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isLatestVersion = (version: string) => true;

const fetchCollectorPluginUpdate = async (): Promise<CollectorModel> => {
    if (!collectorFormStore.collectorId) throw new Error('collector_id is required');
    const params: CollectorUpdatePluginParameter = {
        collector_id: collectorFormStore.collectorId,
        version: collectorFormState.version,
        upgrade_mode: collectorFormState.autoUpgrade ? 'AUTO' : 'MANUAL',
    };
    return SpaceConnector.client.inventory.collector.updatePlugin(params);
};
const fetchCollectorUpdate = async (): Promise<CollectorModel> => {
    if (!collectorFormStore.collectorId) throw new Error('collector_id is required');
    const params: CollectorUpdateParameter = {
        collector_id: collectorFormStore.collectorId,
        tags: collectorFormState.tags,
    };
    return SpaceConnector.client.inventory.collector.update(params);
};


const handleClickEdit = () => {
    state.isEditMode = true;
};

const handleUpdateIsVersionValid = (isValid: boolean) => {
    state.isVersionValid = isValid;
};
const handleUpdateIsTagsValid = (isValid: boolean) => {
    state.isTagsValid = isValid;
};

const handleClickCancel = () => {
    collectorFormStore.resetForm();
    state.isEditMode = false;
};
const handleClickSave = async () => {
    if (!state.isAllValid) return;
    try {
        state.updateLoading = true;
        let collector: CollectorModel|undefined;
        if (state.isPluginUpdated) {
            collector = await fetchCollectorPluginUpdate();
        }
        if (state.isTagsUpdated) {
            const result = await fetchCollectorUpdate();
            if (collector) collector = { ...collector, ...result };
            collector = result;
        }
        if (!collector) throw new Error('collector is undefined'); // collector must be defined if all valid
        collectorFormStore.setOriginCollector(collector);
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.ALT_S_UPDATE_COLLECTOR'), '');
    } catch (e) {
        collectorFormStore.resetVersion();
        collectorFormStore.resetAutoUpgrade();
        collectorFormStore.resetTags();
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.ALT_E_UPDATE_COLLECTOR'));
    } finally {
        state.updateLoading = false;
        state.isEditMode = false;
    }
};

// init reference data
(async () => {
    await store.dispatch('reference/plugin/load');
})();
</script>

<style lang="postcss" scoped>
.p-definition-table {
    border-color: transparent;
}
.collector-base-info-edit {
    padding: 1rem;
    .save-changes-button {
        margin-left: 1rem;
    }
}
</style>
