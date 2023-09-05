import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type { ReferenceItem, ReferenceMap, ReferenceLoadOptions } from '@/store/modules/reference/type';
import type { Currency } from '@/store/modules/settings/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface DataSourceMetadata {
    currency?: Currency;
}
type DataSourceItems = Required<Pick<ReferenceItem<DataSourceMetadata>, 'key'|'label'|'name'|'data'>>;
type DataSourceMap = ReferenceMap<DataSourceItems>;
const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
const lastLoadedTimes: Record<string, number> = {
    dataSource: 0,
};

export const useDataSourceReferenceStore = defineStore('cost-data-source-reference-store', {
    state: () => ({
        items: null as DataSourceMap|null,
    }),
    getters: {
        referenceMap(state) {
            return state.items ?? {};
        },
    },
    actions: {
        async load(options?: ReferenceLoadOptions) {
            const currentTime = new Date().getTime();

            if (
                ((lastLoadedTimes.dataSource !== 0 && currentTime - lastLoadedTimes.dataSource < LOAD_TTL)
                    || (options?.lazyLoad && this.items)
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
                    this.items = items;
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
    },
});
