import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type {
    ListQuery, ListResponse, VariableModelLabel, IBaseVariableModel,
} from '@/lib/variable-models/_base/types';

import ErrorHandler from '@/common/composables/error/errorHandler';


const apiQueryHelper = new ApiQueryHelper();
export default class CostTagKeyVariableModel implements IBaseVariableModel {
    key = 'cost_tag_key';

    name = 'Cost Tags';

    labels = ['cost'] as VariableModelLabel[];

    #response: ListResponse = { results: [] };

    #fetcher?: ReturnType<typeof getCancellableFetcher<{
        results: { cost_tag_keys: string[] }[];
    }>>;

    async list(query: ListQuery = {}): Promise<ListResponse> {
        try {
            if (!query.options?.data_source_id) throw new Error('No \'data_source_id\'');

            if (!this.#fetcher) this.#fetcher = getCancellableFetcher(SpaceConnector.clientV2.costAnalysis.dataSource.list);

            const _query: Record<string, any> = {
                only: ['cost_tag_keys'],
                filter: [
                    {
                        key: 'cost_tag_keys',
                        value: null,
                        operator: 'not',
                    },
                ],
            };
            if (query.filters?.length) {
                apiQueryHelper.setFilters([{ k: 'cost_tag_keys', v: query.filters, o: '=' }]);
                _query.filter.push(...(apiQueryHelper.data?.filter ?? []));
            }
            if (query.search) {
                _query.filter.push({
                    key: 'cost_tag_keys',
                    value: query.search,
                    operator: 'contain',
                });
            }
            const { status, response } = await this.#fetcher({
                data_source_id: query.options.data_source_id,
                query: _query,
            });
            if (status === 'succeed' && response.results?.length) {
                const target = response.results[0]?.cost_tag_keys ?? [];
                this.#response = {
                    results: target.map((d) => ({ key: d, name: `[Tag] ${d}` })),
                };
            }
            return this.#response;
        } catch (e) {
            ErrorHandler.handleError(e);
            return this.#response;
        }
    }
}
