<template>
    <div>
        <p-panel-top>{{ baseState.name }}</p-panel-top>
        <p-definition-table :fields="baseState.fields" :data="baseState.data" :loading="baseState.isLoading"
                            :skeleton-rows="7" v-on="$listeners"
        >
            <template #data-name>
                <p-lazy-img :img-url="baseState.data.tags.icon" width="1rem" height="1rem" />
                <span class="ml-2 leading-none">{{ baseState.data.name }}</span>
            </template>
        </p-definition-table>
        <p-panel-top :use-total-count="true" :total-count="filterState.items? filterState.items.length:0">
            {{ filterState.name }}
        </p-panel-top>
        <p-data-table :items="filterState.items" :fields="filterState.fields" v-on="$listeners" />
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, watch,
} from '@vue/composition-api';
import { dateTimeViewType } from '@/lib/data-source';
import { fluentApi } from '@/lib/fluent-api';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PDefinitionTable from '@/components/organisms/tables/definition-table/PDefinitionTable.vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import { get } from 'lodash';

export default {
    name: 'CollectorDetail',
    components: {
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
        // Base Information
        const baseState = reactive({
            name: 'Base Information',
            isLoading: true,
            fields: computed(() => [
                { label: 'ID', name: 'collector_id' },
                { label: 'Name', name: 'name' },
                { label: 'Provider', name: 'provider' },
                { label: 'Priority', name: 'priority' },
                {
                    label: 'Resource Type',
                    name: 'plugin_info.options.supported_resource_type',
                    type: 'list',
                    options: {
                        item: {},
                        delimiter: ', ',
                    },
                },
                { label: 'Last Collected', name: 'last_collected_at.seconds', ...dateTimeViewType },
                { label: 'Create', name: 'created_at.seconds', ...dateTimeViewType },
            ]),
            data: {},
        });
        const getCollectorDetailData = async () => {
            const res = await fluentApi.inventory().collector().get().setId(props.collectorId)
                .execute();
            baseState.isLoading = false;
            if (res.data) baseState.data = res.data;
        };
        watch(() => props.collectorId, () => {
            getCollectorDetailData();
        });

        // Filter Format
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

        return {
            baseState,
            filterState,
        };
    },
};
</script>
