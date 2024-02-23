import { asyncComputed } from '@vueuse/core';
import {
    computed, reactive,
} from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CostDataSourceListParameters } from '@/schema/cost-analysis/data-source/api-verbs/list';
import type { CostDataSourceModel } from '@/schema/cost-analysis/data-source/model';
// eslint-disable-next-line import/no-cycle
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import type {
    ReferenceItem,
    ReferenceMap,
    ReferenceLoadOptions,
    ReferenceTypeInfo,
} from '@/store/modules/reference/type';

import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import ErrorHandler from '@/common/composables/error/errorHandler';


type PickedCostDataSourceModel = Pick<CostDataSourceModel, 'data_source_id'|'name'|'plugin_info'|'cost_additional_info_keys'|'cost_tag_keys'|'workspace_id'>;
export type CostDataSourceItems = Required<Pick<ReferenceItem<PickedCostDataSourceModel>, 'key'|'label'|'name'|'data'>>;
export type CostDataSourceReferenceMap = ReferenceMap<CostDataSourceItems>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useCostDataSourceReferenceStore = defineStore('cost-data-source-reference-store', () => {
    const appContextStore = useAppContextStore();
    const _state = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    });
    const state = reactive({
        items: null as CostDataSourceReferenceMap|null,
    });

    const getters = reactive({
        costDataSourceItems: asyncComputed<CostDataSourceReferenceMap>(async () => {
            if (store.getters['user/getCurrentGrantInfo'].scope === 'USER') return {};
            if (state.items === null) await actions.load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        costDataSourceTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODELS.cost_data_source.meta.key,
            key: MANAGED_VARIABLE_MODELS.cost_data_source.meta.idKey,
            name: MANAGED_VARIABLE_MODELS.cost_data_source.meta.name,
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
                        only: ['data_source_id', 'name', 'plugin_info', 'cost_additional_info_keys', 'cost_tag_keys', 'workspace_id', 'cost_data_keys'],
                        sort: [{ key: 'workspace_id', desc: _state.isAdminMode }],
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
