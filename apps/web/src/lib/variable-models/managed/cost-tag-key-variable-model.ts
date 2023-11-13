import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type {
    ListQuery, ListResponse, VariableModelLabel, IBaseVariableModel,
} from '@/lib/variable-models/_base/types';
import { getRefinedDependencyOptions } from '@/lib/variable-models/_helpers/dependency-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';


const apiQueryHelper = new ApiQueryHelper();
export default class CostTagKeyVariableModel implements IBaseVariableModel {
    key = 'cost_tag_key';

    name = 'Cost Tags';

    labels = ['cost'] as VariableModelLabel[];

    dependencies = {
        cost_data_source: 'data_source_id',
    };

    #response: ListResponse = { results: [] };

    #fetcher?: ReturnType<typeof getCancellableFetcher<{
        results: { cost_tag_keys: string[] }[];
    }>>;

    // eslint-disable-next-line class-methods-use-this
    nameFormatter(data: any) {
        return `[Tag] ${data}`;
    }

    async list(query: ListQuery = {}): Promise<ListResponse> {
        try {
            const dependencyOptions = getRefinedDependencyOptions(this.dependencies, query.options);

            if (!this.#fetcher) this.#fetcher = getCancellableFetcher(SpaceConnector.clientV2.costAnalysis.dataSource.list);

            apiQueryHelper.setOnly('cost_tag_keys')
                .setFilters([{
                    k: 'cost_tag_keys',
                    v: null,
                    o: '!=',
                }]);
            const { status, response } = await this.#fetcher({
                ...dependencyOptions,
                query: apiQueryHelper.data,
            });
            if (status === 'succeed' && response.results?.length) {
                const target = response.results[0]?.cost_tag_keys ?? [];
                let _results = target.map((d) => ({ key: `tags.${d}`, name: `[Tag] ${d}` }));
                if (query.search) {
                    _results = _results.filter((d) => d.name.toLowerCase().includes(query.search as string));
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
