<template>
    <div>
        <p-panel-top>{{ baseState.name }}</p-panel-top>
        <p-definition-table :fields="baseState.fields" :data="baseState.data" :loading="baseState.loading"
                            :skeleton-rows="7" v-on="$listeners"
        >
            <template #data-name>
                <p-lazy-img :src="baseState.data.tags.icon" width="1rem" height="1rem" />
                <span class="ml-2 leading-none">{{ baseState.data.name }}</span>
            </template>
            <template #data-plugin_info.options.supported_resource_type="{data}">
                <p-text-list :items="data || []" delimiter=", " />
            </template>
        </p-definition-table>
        <p-panel-top :use-total-count="true" :total-count="filterState.items? filterState.items.length:0">
            {{ filterState.name }}
        </p-panel-top>
        <p-data-table :items="filterState.items" :fields="filterState.fields" v-on="$listeners" />
    </div>
</template>

<script lang="ts">
import { get } from 'lodash';

import { computed, reactive, watch } from '@vue/composition-api';

import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PDefinitionTable from '@/components/organisms/tables/definition-table/PDefinitionTable.vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PTextList from '@/components/molecules/lists/text-list/PTextList.vue';

import { timestampFormatter } from '@/lib/util';
import { SpaceConnector } from '@/lib/space-connector';

export default {
    name: 'CollectorDetail',
    components: {
        PTextList,
        PPanelTop,
        PDefinitionTable,
        PDataTable,
        PLazyImg,
    },
    props: {
        collectorId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const baseState = reactive({
            name: 'Base Information',
            loading: true,
            fields: computed(() => [
                { label: 'ID', name: 'collector_id' },
                { label: 'Name', name: 'name' },
                { label: 'Provider', name: 'provider' },
                { label: 'Priority', name: 'priority' },
                { label: 'Resource Type', name: 'plugin_info.options.supported_resource_type' },
                { label: 'Last Collected', name: 'last_collected_at', formatter: timestampFormatter },
                { label: 'Created', name: 'created_at', formatter: timestampFormatter },
            ]),
            data: {},
        });

        const filterState = reactive({
            name: 'Filter Format',
            fields: computed(() => [
                { label: 'Name', name: 'name' },
                { label: 'Key', name: 'key' },
                { label: 'Type', name: 'type' },
                { label: 'Resource Type', name: 'resource_type' },
            ]),
            rootPath: 'plugin_info.options.filter_format',
            items: computed(() => get(baseState.data, filterState.rootPath, [])),
        });

        /* api */
        const getCollectorDetailData = async () => {
            const res = await SpaceConnector.client.inventory.collector.get({
                collector_id: props.collectorId,
            });
            baseState.loading = false;
            console.log(res);
            if (res) baseState.data = res;
        };
        watch(() => props.collectorId, () => {
            getCollectorDetailData();
        }, { immediate: true });

        return {
            baseState,
            filterState,
        };
    },
};
</script>
