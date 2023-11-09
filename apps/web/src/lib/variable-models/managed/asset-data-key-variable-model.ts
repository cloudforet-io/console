import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type {
    ListQuery, ListResponse, VariableModelLabel, IBaseVariableModel,
} from '@/lib/variable-models/_base/types';
import { getRefinedDependencyOptions } from '@/lib/variable-models/dependency-helper';

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

            const _query: Record<string, any> = {
                only: ['data_keys'],
                filter: [
                    {
                        key: 'data_keys',
                        value: null,
                        operator: 'not',
                    },
                ],
            };
            if (query.filters?.length) {
                apiQueryHelper.setFilters([{ k: 'data_keys', v: query.filters, o: '=' }]);
                _query.filter.push(...(apiQueryHelper.data?.filter ?? []));
            }
            if (query.search) {
                _query.filter.push({
                    key: 'data_keys',
                    value: query.search,
                    operator: 'contain',
                });
            }
            const { status, response } = await this.#fetcher({
                ...dependencyOptions, // TODO: check its working
                query: _query,
            });
            if (status === 'succeed' && response.results?.length) {
                const target = response.results[0]?.data_keys ?? [];
                this.#response = {
                    results: target.map((d) => ({ key: d, name: d })),
                };
            }
            return this.#response;
        } catch (e) {
            ErrorHandler.handleError(e);
            return this.#response;
        }
    }
}
