import { getTextHighlightRegex } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type {
    ListQuery, ListResponse, VariableModelLabel, IBaseVariableModel,
} from '@/lib/variable-models/_base/types';
import { getRefinedDependencyOptions } from '@/lib/variable-models/_helpers/dependency-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';


const apiQueryHelper = new ApiQueryHelper();
export default class AssetDataKeyVariableModel implements IBaseVariableModel {
    key = 'asset_data_key';

    name = 'Data Type (Asset)';

    labels: VariableModelLabel[] = ['asset'];

    dependencies = {
        cloud_service_query_set: 'query_set_id',
    };

    #response: ListResponse = { results: [] };

    #fetcher?: ReturnType<typeof getCancellableFetcher<{
        results: { data_keys: string[] }[];
    }>>;

    async list(query: ListQuery = {}): Promise<ListResponse> {
        try {
            const dependencyOptions = getRefinedDependencyOptions(this.dependencies, query.options);

            if (!this.#fetcher) this.#fetcher = getCancellableFetcher(SpaceConnector.clientV2.inventory.cloudServiceQuerySet.list);

            apiQueryHelper.setOnly('data_keys')
                .setFilters([{
                    k: 'data_keys',
                    v: null,
                    o: '!=',
                }]);
            const { status, response } = await this.#fetcher({
                ...dependencyOptions,
                query: apiQueryHelper.data,
            });
            if (status === 'succeed' && response.results?.length) {
                const target = response.results[0]?.data_keys ?? [];
                let results = target.map((d) => ({ key: d, name: d }));
                let more = false;
                if (query.filters?.length) {
                    results = results.filter((item) => query.filters?.includes(item.key));
                }
                if (query.search) {
                    const regex = getTextHighlightRegex(query.search);
                    results = results.filter((item) => regex.test(item.name));
                }
                if (query.start !== undefined && query.limit !== undefined) {
                    const end = query.start + query.limit - 1;
                    more = end < results.length;
                    results = results.slice(query.start - 1, end);
                }
                this.#response = { results, more };
            }
            return this.#response;
        } catch (e) {
            ErrorHandler.handleError(e);
            return this.#response;
        }
    }
}
