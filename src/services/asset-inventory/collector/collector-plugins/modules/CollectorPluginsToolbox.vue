<template>
    <div>
        <slot name="filters" />
        <p-toolbox :total-count="totalCount"
                   :sortable="true"
                   :page-size-changeable="false"
                   sort-by="name"
                   :sort-by-options="sortByOptions"
                   @change="handleChange"
                   @refresh="handleChange()"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from 'vue';

import { PToolbox } from '@spaceone/design-system';
import type { ToolboxOptions } from '@spaceone/design-system/dist/src/navigation/toolbox/type';

import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/core-lib/component-util/query-search/type';
import type { QueryStoreFilter } from '@cloudforet/core-lib/query/type';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

interface Props {
    totalCount: number;
    filters: QueryStoreFilter[];
    handlers: { keyItemSets: KeyItemSet[]; valueHandlerMap: ValueHandlerMap };
}

export default {
    name: 'CollectorPluginsToolbox',
    components: {
        PToolbox,
    },
    props: {
        totalCount: {
            type: Number,
            default: 0,
        },
        filters: {
            type: Array,
            default: () => ([]),
        },
        handlers: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: Props, { emit }) {
        const state = reactive({
            providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
            selectedProvider: computed(() => store.state.service.assetInventory.cloudService.selectedProvider),
            selectedCategories: computed(() => store.state.service.assetInventory.cloudService.selectedCategories),
            selectedRegions: computed(() => store.state.service.assetInventory.cloudService.selectedRegions),
            keyItemSets: props.handlers.keyItemSets,
            valueHandlerMap: props.handlers.valueHandlerMap,
            cloudServiceFilters: computed(() => props.filters.filter((f: QueryStoreFilter) => f.k && ![
                'labels',
                'service_code',
            ].includes(f.k))),
            sortByOptions: computed(() => [
                { type: 'item', label: i18n.t('PLUGIN.COLLECTOR.PLUGINS.NAME'), name: 'name' },
                { type: 'item', label: i18n.t('PLUGIN.COLLECTOR.PLUGINS.RECENT'), name: 'created_at' },
            ]),
        });

        /* event */
        const handleChange = async (options: ToolboxOptions = {}) => {
            emit('update-toolbox', options);
        };

        // LOAD REFERENCE STORE
        (async () => {
            await store.dispatch('reference/provider/load');
        })();

        return {
            ...toRefs(state),
            handleChange,
        };
    },
};
</script>
