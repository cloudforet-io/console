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
                <!-- TODO: Remove test code below: 'Name!' -->
                <span class="ml-2 leading-none">{{ state.pluginName || 'Name!' }}</span>
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
            <collector-plugin-contents :plugin="state.plugin" />
            <collector-version-form @update:isVersionValid="handleUpdateIsVersionValid" />
            <collector-tag-form :service-name="$t('MENU.ASSET_INVENTORY_COLLECTOR')"
                                @update:isTagsValid="handleUpdateIsTagsValid"
            />
            <p-button style-type="tertiary"
                      size="lg"
                      @click="handleClickCancel"
            >
                {{ $t('INVENTORY.COLLECTOR.DETAIL.CANCEL') }}
            </p-button>
            <p-button style-type="primary"
                      size="lg"
                      class="save-changes-button"
                      :disabled="!state.isAllValid"
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

import { store } from '@/store';
import { i18n } from '@/translations';

import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
import CollectorTagForm from '@/services/asset-inventory/collector/shared/collector-forms/CollectorTagForm.vue';
import CollectorVersionForm from '@/services/asset-inventory/collector/shared/collector-forms/CollectorVersionForm.vue';
import CollectorPluginContents from '@/services/asset-inventory/collector/shared/CollectorPluginContents.vue';
import type { CollectorPluginModel } from '@/services/asset-inventory/collector/type';
import { UPGRADE_MODE } from '@/services/asset-inventory/collector/type';

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
    plugin: computed<CollectorPluginModel|null>(() => collectorFormState.pluginInfo),
    pluginName: computed<string>(() => state.plugin?.name ?? ''),
    pluginIcon: computed<string>(() => state.plugin?.tags.icon ?? ''),
    isEditMode: false,
    isVersionValid: false,
    isTagsValid: false,
    isAllValid: computed(() => state.isVersionValid && state.isTagsValid),
});

// TODO: Implement isLatestVersion
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isLatestVersion = (version: string) => true;

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
const handleClickSave = () => {
    state.isEditMode = false;
    // TODO: change codes below. Call update api and set originCollector with api response
    if (!collectorFormState.originCollector) return;
    collectorFormStore.setOriginCollector({
        ...collectorFormState.originCollector,
        plugin_info: {
            ...collectorFormState.originCollector.plugin_info,
            version: collectorFormState.version,
            upgrade_mode: collectorFormState.autoUpdate ? 'AUTO' : 'MANUAL',
        },
        tags: collectorFormState.tags,
    });
};

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
