import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type {
    ListQuery, ListResponse, VariableModelLabel, IBaseVariableModel,
} from '@/lib/variable-models/_base/types';

import ErrorHandler from '@/common/composables/error/errorHandler';


const apiQueryHelper = new ApiQueryHelper();
export default class AssetAdditionalInfoKeyVariableModel implements IBaseVariableModel {
    key = 'asset_additional_info_key';

    name = 'Asset Additional Info';

    labels = ['asset'] as VariableModelLabel[];

    #response: ListResponse = { results: [] };

    #fetcher = getCancellableFetcher(SpaceConnector.clientV2.inventory.cloudServiceQuerySet.list);

    async list(query: ListQuery = {}): Promise<ListResponse> {
        if (!query.options?.query_set_id) throw new Error('No \'query_set_id\''); // TODO: check its working
        try {
            const _query: Record<string, any> = {
                only: ['additional_info_keys'],
                filter: [
                    {
                        key: 'additional_info_keys',
                        value: null,
                        operator: 'not',
                    },
                ],
            };
            if (query.filters?.length) {
                apiQueryHelper.setFilters([{ k: 'additional_info_keys', v: query.filters, o: '=' }]);
                _query.filter.push(...(apiQueryHelper.data?.filter ?? []));
            }
            if (query.search) {
                _query.filter.push({
                    key: 'additional_info_keys',
                    value: query.search,
                    operator: 'contain',
                });
            }
            const { status, response } = await this.#fetcher({
                query_set_id: query.options.query_set_id,
                query: _query,
            });
            if (status === 'succeed' && response.results?.length) {
                const target = response.results[0]?.additional_info_keys ?? [];
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
