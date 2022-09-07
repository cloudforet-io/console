<template>
    <div>
        <p-panel-top>{{ baseState.name }}</p-panel-top>
        <p-definition-table :fields="baseState.fields" :data="baseState.data" :loading="baseState.loading"
                            :skeleton-rows="7" v-on="$listeners"
        >
            <template #data-state="{data}">
                <p-status :text="data" :theme="data === 'DISABLED' ? 'red' : 'green'" />
            </template>
            <template #data-plugin_name="{data}">
                <p-lazy-img :src="baseState.data.plugin_icon" width="1rem" height="1rem" />
                <span class="ml-2 leading-none">{{ data }}</span>
            </template>
            <template #data-plugin_info.metadata.metadata.supported_resource_type="{data}">
                <p-text-list :items="data || []" delimiter="<br>" class="text-list" />
            </template>
            <template #data-created_at="{ data }">
                {{ data ? iso8601Formatter(data, baseState.timezone) : '' }}
            </template>
            <template #data-last_collected_at="{ data }">
                {{ data ? iso8601Formatter(data, baseState.timezone) : '' }}
            </template>
        </p-definition-table>
    </div>
</template>

<script lang="ts">


import { iso8601Formatter } from '@spaceone/console-core-lib';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    PPanelTop, PDefinitionTable, PLazyImg, PStatus, PTextList,
} from '@spaceone/design-system';
import {
    computed, getCurrentInstance, reactive, watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { store } from '@/store';

export default {
    name: 'CollectorDetails',
    components: {
        PStatus,
        PTextList,
        PPanelTop,
        PDefinitionTable,
        PLazyImg,
    },
    props: {
        collectorId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const vm = getCurrentInstance()?.proxy as Vue;
        const baseState = reactive({
            name: computed(() => vm.$t('PLUGIN.COLLECTOR.MAIN.DETAILS_BASE_TITLE')),
            timezone: computed(() => vm.$store.state.user.timezone) as unknown as string,
            loading: true,
            fields: computed(() => [
                { label: vm.$t('PLUGIN.COLLECTOR.MAIN.DETAILS_BASE_LABEL_NAME'), name: 'name' },
                { label: vm.$t('PLUGIN.COLLECTOR.MAIN.DETAILS_BASE_LABEL_STATE'), name: 'state' },
                { label: vm.$t('PLUGIN.COLLECTOR.MAIN.DETAILS_BASE_LABEL_PLUGIN'), name: 'plugin_name' },
                { label: vm.$t('PLUGIN.COLLECTOR.MAIN.DETAILS_BASE_LABEL_VERSION'), name: 'plugin_info.version' },
                { label: vm.$t('PLUGIN.COLLECTOR.MAIN.DETAILS_BASE_LABEL_PROVIDER'), name: 'provider' },
                { label: vm.$t('PLUGIN.COLLECTOR.MAIN.DETAILS_BASE_LABEL_LAST_COLLECTED'), name: 'last_collected_at' },
                { label: vm.$t('PLUGIN.COLLECTOR.MAIN.DETAILS_BASE_LABEL_CREATED'), name: 'created_at' },
            ]),
            data: {},
        });


        /* api */
        const getCollectorDetailData = async () => {
            const res = await SpaceConnector.client.inventory.collector.get({
                collector_id: props.collectorId,
                only: ['name', 'provider', 'state', 'plugin_info.version',
                    'last_collected_at', 'created_at', 'tags', 'plugin_info.plugin_id'],

                // ...baseState.fields.map(d => d.name)
            });
            baseState.loading = false;
            if (res) {
                baseState.data = {
                    // eslint-disable-next-line camelcase
                    plugin_name: store.state.reference.plugin.items[res.plugin_info.plugin_id]?.label,
                    // eslint-disable-next-line camelcase
                    plugin_icon: store.state.reference.plugin.items[res.plugin_info.plugin_id]?.icon,
                    ...res,
                };
            }
        };
        watch(() => props.collectorId, () => {
            getCollectorDetailData();
        }, { immediate: true });

        // LOAD REFERENCE STORE
        (async () => {
            await store.dispatch('reference/plugin/load');
        })();

        return {
            baseState,
            iso8601Formatter,
        };
    },
};
</script>
<style lang="postcss">
.text-list {
    line-height: inherit;
}
</style>
