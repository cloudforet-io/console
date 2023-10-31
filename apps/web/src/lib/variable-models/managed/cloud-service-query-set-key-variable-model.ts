import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type {
    ListQuery, ListResponse, VariableModelLabel, IBaseVariableModel,
} from '@/lib/variable-models/_base/types';

import ErrorHandler from '@/common/composables/error/errorHandler';


export default class CloudServiceQuerySetKeyVariableModel implements IBaseVariableModel {
    key = 'cloud_service_query_set_key';

    name = 'Data Type (Asset)';

    labels: VariableModelLabel[] = ['asset'];

    #response: ListResponse = { results: [] };

    #fetcher = getCancellableFetcher(SpaceConnector.clientV2.inventory.cloudServiceQuerySet.list);

    async list(query: ListQuery = {}): Promise<ListResponse> {
        if (!query.options?.query_set_id) throw new Error('No \'query_set_id\'');
        // TODO: change from filters(string[]) to api filters
        try {
            const _query: Record<string, any> = {
                only: ['keys'],
                filter: [
                    {
                        key: 'keys',
                        value: null,
                        operator: 'not',
                    },
                ],
            };
            if (query.search) {
                _query.filter.push({
                    key: 'keys',
                    value: query.search,
                    operator: 'contain',
                });
            }
            const { status, response } = await this.#fetcher({
                // query_set_id: ?? TODO: set query_set_id
                query: _query,
            });
            if (status === 'succeed' && response.results?.length) {
                const target = response.results[0]?.keys ?? [];
                this.#response = {
                    results: target.map((d) => ({ key: d })),
                };
            }
            return this.#response;
        } catch (e) {
            ErrorHandler.handleError(e);
            return this.#response;
        }
    }
}
