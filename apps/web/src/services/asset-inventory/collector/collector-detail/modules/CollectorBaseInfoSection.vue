<template>
    <p-pane-layout>
        <p-heading :title="$t('INVENTORY.COLLECTOR.DETAIL.BASE_INFO')"
                   heading-type="sub"
        >
            <template #extra>
                <p-button size="md"
                          icon-left="ic_edit"
                          style-type="secondary"
                >
                    {{ $t('INVENTORY.COLLECTOR.DETAIL.EDIT') }}
                </p-button>
            </template>
        </p-heading>

        <p-definition-table :fields="fields"
                            :loading="props.loading"
                            :data="props.collector"
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

import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';

import type { CollectorModel } from '@/services/asset-inventory/collector/type';
import { UPGRADE_MODE } from '@/services/asset-inventory/collector/type';

const props = defineProps<{
    loading: boolean;
    collector: CollectorModel|null;
}>();

const timezone = computed<string>(() => store.state.user.timezone);
const plugins = computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']);
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
    pluginName: computed<string>(() => (props.collector ? plugins.value[props.collector.plugin_info.plugin_id]?.label ?? '' : '')),
    pluginIcon: computed<string>(() => (props.collector ? plugins.value[props.collector.plugin_info.plugin_id]?.icon ?? '' : '')),
});

// TODO: Implement isLatestVersion
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isLatestVersion = (version: string) => true;

</script>

