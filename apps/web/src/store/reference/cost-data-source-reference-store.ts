import { asyncComputed } from '@vueuse/core';
import {
    computed, reactive,
} from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';


import type { DataSourceModel } from '@/schema/cost-analysis/data-source/model';

import type {
    ReferenceItem,
    ReferenceMap,
    ReferenceLoadOptions,
} from '@/store/modules/reference/type';
import type { ReferenceTypeInfo } from '@/store/reference/all-reference-store';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import ErrorHandler from '@/common/composables/error/errorHandler';


type PickedDataSourceModel = Pick<DataSourceModel, 'data_source_id'|'name'|'plugin_info'|'cost_additional_info_keys'|'cost_tag_keys'>;
export type DataSourceItems = Required<Pick<ReferenceItem<PickedDataSourceModel>, 'key'|'label'|'name'|'data'>>;
export type CostDataSourceReferenceMap = ReferenceMap<DataSourceItems>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useCostDataSourceReferenceStore = defineStore('cost-data-source-reference-store', () => {
    const state = reactive({
        items: null as CostDataSourceReferenceMap|null,
    });

    const getters = reactive({
        costDataSourceItems: asyncComputed<CostDataSourceReferenceMap>(async () => {
            if (state.items === null) await actions.load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        costDataSourceTypeInfo: computed<ReferenceTypeInfo>(() => ({
            ...REFERENCE_TYPE_INFO.cost_data_source,
            referenceMap: getters.costDataSourceItems,
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
            lastLoadedTime = currentTime;

            const fetcher = getCancellableFetcher(SpaceConnector.clientV2.costAnalysis.dataSource.list);
            try {
                const { status, response } = await fetcher({
                    query: {
                        only: ['data_source_id', 'name', 'plugin_info', 'cost_additional_info_keys', 'cost_tag_keys'],
                    },
                });
                if (status === 'succeed') {
                    const items: CostDataSourceReferenceMap = {};
                    response.results.forEach((item: DataSourceModel) => {
                        items[item.data_source_id] = {
                            key: item.data_source_id,
                            label: item.name,
                            name: item.name,
                            data: item,
                        };
                    });
                    state.items = items;
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        flush() { state.items = null; },
    };

    return {
        getters,
        ...actions,
    };
});
