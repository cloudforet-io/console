import { getTextHighlightRegex } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type {
    ListQuery, ListResponse,
    VariableModelConstructorConfig,
} from '@/lib/variable-models/_base/types';
import { getRefinedDependencyOptions } from '@/lib/variable-models/_helpers/dependency-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';


const apiQueryHelper = new ApiQueryHelper();
export default class CostTagKeyVariableModel extends ResourceVariableModel {
    static meta = {
        key: 'cost_tag_key',
        name: 'Cost Tags',
        resourceType: 'cost_analysis.DataSource',
        idKey: 'data_source_id',
        nameKey: 'name',
    };

    private dependencies = {
        cost_data_source: 'data_source_id',
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = CostTagKeyVariableModel.meta;
    }

    #response: ListResponse = { results: [] };

    #fetcher?: ReturnType<typeof getCancellableFetcher<object, {
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
                let results = target.map((d) => ({ key: `tags.${d}`, name: `[Tag] ${d}` }));
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
