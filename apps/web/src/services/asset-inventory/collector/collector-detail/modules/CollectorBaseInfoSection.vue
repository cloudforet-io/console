<template>
    <p-pane-layout>
        <p-heading :title="i18n.t('INVENTORY.COLLECTOR.DETAIL.BASE_INFO')"
                   heading-type="sub"
        >
            <template #extra>
                <p-button size="md"
                          icon-left="ic_edit"
                          style-type="secondary"
                >
                    {{ i18n.t('INVENTORY.COLLECTOR.DETAIL.EDIT') }}
                </p-button>
            </template>
        </p-heading>

        <p-definition-table :fields="fields"
                            :loading="loading"
                            :data="collector"
        >
            <template #data-pluginName>
                <p-lazy-img :src="pluginIcon"
                            :loading="loading"
                            width="1rem"
                            height="1rem"
                />
                <!-- TODO: Remove test code below: 'Name!' -->
                <span class="ml-2 leading-none">{{ pluginName || 'Name!' }}</span>
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
    defineProps, computed, ref, onMounted,
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/ban-types
const props = defineProps<{}>();

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
const collector = ref<null|CollectorModel>(null);
const loading = ref(true);

const plugins = computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']);
const pluginName = computed<string>(() => (collector.value ? plugins.value[collector.value.plugin_info.plugin_id]?.label ?? '' : ''));
const pluginIcon = computed<string>(() => (collector.value ? plugins.value[collector.value.plugin_info.plugin_id]?.icon ?? '' : ''));

// TODO: Implement isLatestVersion
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isLatestVersion = (version: string) => true;


// TODO: move to upper level
const getCollector = async (): Promise<CollectorModel> => {
    loading.value = true;
    // TODO: change to real data
    const result = await new Promise<CollectorModel>((resolve) => {
        setTimeout(() => {
            resolve({
                collector_id: 'collector-1',
                name: 'collector-1',
                state: 'ENABLED',
                provider: 'aws',
                capability: {
                    supported_schema: ['aws_access_key', 'aws_access_key_pair'],
                    supported_mode: ['FULL', 'DIFF'],
                    supported_schedule: ['* * * * *'],
                },
                plugin_info: {
                    plugin_id: 'plugin-1',
                    version: '1.0',
                    upgrade_mode: 'AUTO',
                    options: {
                        supported_resource_type: ['inventory.Server'],
                        filter_format: [],
                    },
                },
                priority: 1,
                tags: {
                    'spaceone:region': 'kr',
                    'spaceone:zone': 'kr-1',
                },
                last_collected_at: '2021-08-31T00:00:00Z',
                created_at: '2021-08-31T00:00:00Z',
            });
        }, 2000);
    });
    loading.value = false;
    return result;
};

onMounted(async () => {
    collector.value = await getCollector();
});

</script>
