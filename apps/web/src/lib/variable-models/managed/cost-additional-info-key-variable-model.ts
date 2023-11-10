import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type {
    ListQuery, ListResponse, VariableModelLabel, IBaseVariableModel,
} from '@/lib/variable-models/_base/types';
import { getRefinedDependencyOptions } from '@/lib/variable-models/_helpers/dependency-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';


const apiQueryHelper = new ApiQueryHelper();
export default class CostAdditionalInfoKeyVariableModel implements IBaseVariableModel {
    key = 'cost_additional_info_key';

    name = 'Cost Additional Info';

    labels = ['cost'] as VariableModelLabel[];

    dependencies = {
        cost_data_source: 'data_source_id',
    };

    #response: ListResponse = { results: [] };

    #fetcher?: ReturnType<typeof getCancellableFetcher<{
        results: { cost_additional_info_keys: string[] }[];
    }>>;

    async list(query: ListQuery = {}): Promise<ListResponse> {
        try {
            const dependencyOptions = getRefinedDependencyOptions(this.dependencies, query.options);

            if (!this.#fetcher) this.#fetcher = getCancellableFetcher(SpaceConnector.clientV2.costAnalysis.dataSource.list);

            const _query: Record<string, any> = {
                only: ['cost_additional_info_keys'],
                filter: [
                    {
                        key: 'cost_additional_info_keys',
                        value: null,
                        operator: 'not',
                    },
                ],
            };
            if (query.filters?.length) {
                const filters = query.filters.map((f) => (f.startsWith('additional_info.') ? f.replace('additional_info.', '') : f));
                apiQueryHelper.setFilters([{ k: 'cost_additional_info_keys', v: filters, o: '=' }]);
                _query.filter.push(...(apiQueryHelper.data?.filter ?? []));
            }
            if (query.search) {
                _query.filter.push({
                    key: 'cost_additional_info_keys',
                    value: query.search,
                    operator: 'contain',
                });
            }
            const { status, response } = await this.#fetcher({
                ...dependencyOptions,
                query: _query,
            });
            if (status === 'succeed' && response.results?.length) {
                const target = response.results[0]?.cost_additional_info_keys ?? [];
                this.#response = {
                    results: target.map((d) => ({ key: `additional_info.${d}`, name: d })),
                };
            }
            return this.#response;
        } catch (e) {
            ErrorHandler.handleError(e);
            return this.#response;
        }
    }
}
