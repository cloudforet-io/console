

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';

import type {
    ReferenceItem,
    ReferenceMap,
    ReferenceLoadOptions,
} from '@/store/modules/reference/type';
import type { ReferenceTypeInfo } from '@/store/reference/all-reference-store';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DataSourceModel } from '@/services/cost-explorer/model';


type PickedDataSourceModel = Pick<DataSourceModel, 'data_source_id'|'name'|'plugin_info'>;
type DataSourceItems = Required<Pick<ReferenceItem<PickedDataSourceModel>, 'key'|'label'|'name'|'data'>>;
type DataSourceMap = ReferenceMap<DataSourceItems>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
const lastLoadedTime = 0;

export const useCostDataSourceReferenceStore = defineStore('cost-data-source-reference-store', () => {
    const state = reactive({
        items: null as DataSourceMap|null,
    });

    const getters = reactive({
        costDataSourceItems: computed(() => state.items ?? {}),
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


            const fetcher = getCancellableFetcher(SpaceConnector.clientV2.costAnalysis.dataSource.list);
            try {
                const { status, response } = await fetcher({
                    query: {
                        only: ['data_source_id', 'name', 'plugin_info'],
                    },
                });
                if (status === 'succeed') {
                    const items: DataSourceMap = {};
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
    };

    actions.load();

    return {
        getters,
        ...actions,
    };
});
