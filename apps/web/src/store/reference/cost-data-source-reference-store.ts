import { asyncComputed } from '@vueuse/core';
import {
    computed, reactive,
} from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CostDataSourceListParameters } from '@/schema/cost-analysis/data-source/api-verbs/list';
import type { CostDataSourceModel } from '@/schema/cost-analysis/data-source/model';

import type {
    ReferenceItem,
    ReferenceMap,
    ReferenceLoadOptions,
} from '@/store/modules/reference/type';
import type { ReferenceTypeInfo } from '@/store/reference/all-reference-store';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import ErrorHandler from '@/common/composables/error/errorHandler';


type PickedCostDataSourceModel = Pick<CostDataSourceModel, 'data_source_id'|'name'|'plugin_info'|'cost_additional_info_keys'|'cost_tag_keys'|'workspace_id'>;
export type CostDataSourceItems = Required<Pick<ReferenceItem<PickedCostDataSourceModel>, 'key'|'label'|'name'|'data'>>;
export type CostDataSourceReferenceMap = ReferenceMap<CostDataSourceItems>;

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
        hasLoaded: computed<boolean>(() => state.items !== null),
    });

    const actions = {
        async load(options?: ReferenceLoadOptions) {
            const currentTime = new Date().getTime();

            if (
                ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                    || (options?.lazyLoad && state.items)
                ) && !options?.force
            ) return;

            try {
                const res = await SpaceConnector.clientV2.costAnalysis.dataSource.list<CostDataSourceListParameters, ListResponse<CostDataSourceModel>>({
                    query: {
                        only: ['data_source_id', 'name', 'plugin_info', 'cost_additional_info_keys', 'cost_tag_keys', 'workspace_id'],
                    },
                });
                const items: CostDataSourceReferenceMap = {};
                res.results?.forEach((item: CostDataSourceModel) => {
                    items[item.data_source_id] = {
                        key: item.data_source_id,
                        label: item.name,
                        name: item.name,
                        data: item,
                    };
                });
                state.items = items;
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                lastLoadedTime = currentTime;
            }
        },
        flush() {
            state.items = null;
            lastLoadedTime = 0;
        },
    };

    return {
        getters,
        ...actions,
    };
});
