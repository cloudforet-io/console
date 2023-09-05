import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type {
    ReferenceItem,
    ReferenceMap,
    ReferenceLoadOptions,
} from '@/store/modules/reference/type';
import type { Currency } from '@/store/modules/settings/type';
import type { ReferenceTypeInfo } from '@/store/reference/all-reference-store';

import { COST_REFERENCE_TYPE_INFO } from '@/lib/reference/cost-reference-config';

import ErrorHandler from '@/common/composables/error/errorHandler';


interface DataSourceMetadata {
    currency?: Currency;
}
type DataSourceItems = Required<Pick<ReferenceItem<DataSourceMetadata>, 'key'|'label'|'name'|'data'>>;
type DataSourceMap = ReferenceMap<DataSourceItems>;
const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
const lastLoadedTime = 0;

export const useCostDataSourceReferenceStore = defineStore('cost-data-source-reference-store', () => {
    const state = reactive({
        items: null as DataSourceMap|null,
    });

    const getters = reactive({
        referenceMap: asyncComputed(async () => {
            await actions.load();
            return state.items ?? {};
        }),
        costDataSourceTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: COST_REFERENCE_TYPE_INFO.cost_data_source.type,
            key: COST_REFERENCE_TYPE_INFO.cost_data_source.key,
            name: COST_REFERENCE_TYPE_INFO.cost_data_source.name,
            referenceMap: getters.referenceMap,
        })),
    });

    const actions = {
        async load(options?: ReferenceLoadOptions) {
            const currentTime = new Date().getTime();

            if (
                ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                    || (options?.lazyLoad && state.items)
                ) && !options?.force
            ) return;


            const fetcher = getCancellableFetcher(SpaceConnector.clientV2.costAnalysis.dataSource.list);
            try {
                const { status, response } = await fetcher({
                    query: {
                        only: ['data_source_id', 'name', 'plugin_info.metadata'],
                    },
                });
                if (status === 'succeed') {
                    const items: DataSourceMap = {};
                    response.results.forEach((item: any) => {
                        items[item.data_source_id] = {
                            key: item.data_source_id,
                            label: item.name,
                            name: item.name,
                            data: item.plugin_info.metadata,
                        };
                    });
                    state.items = items;
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
    };

    actions.load();

    return {
        $state: state,
        $patch: (_state) => {
            Object.assign(_state, state);
        },
        getters,
        ...actions,
    };
});
