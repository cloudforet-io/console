import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type {
    ListQuery, ListResponse, VariableModelLabel, IBaseVariableModel,
} from '@/lib/variable-models/_base/types';

import ErrorHandler from '@/common/composables/error/errorHandler';


export default class CostDataSourceKeyVariableModel implements IBaseVariableModel {
    key = 'cost_data_source_key';

    name = 'Data Type (Cost)';

    labels: VariableModelLabel[] = ['cost'];

    #response: ListResponse = { results: [] };

    #fetcher = getCancellableFetcher(SpaceConnector.clientV2.costAnalysis.dataSource.list);

    async list(query: ListQuery = {}): Promise<ListResponse> {
        if (!query.options?.data_source_id) throw new Error('No \'data_source_id\'');
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
                data_source_id: query.options.data_source_id, // TODO: check its working
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
