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

            apiQueryHelper.setOnly('cost_additional_info_keys')
                .setFilters([{
                    k: 'cost_additional_info_keys',
                    v: null,
                    o: '!=',
                }]);
            const { status, response } = await this.#fetcher({
                ...dependencyOptions,
                query: apiQueryHelper.data,
            });
            if (status === 'succeed' && response.results?.length) {
                const target = response.results[0]?.cost_additional_info_keys ?? [];
                let _results = target.map((d) => ({ key: `additional_info.${d}`, name: d }));
                if (query.search) {
                    _results = _results.filter((d) => d.name.toLowerCase().includes(query.search?.toLowerCase() as string));
                }
                this.#response = { results: _results };
            }
            return this.#response;
        } catch (e) {
            ErrorHandler.handleError(e);
            return this.#response;
        }
    }
}
