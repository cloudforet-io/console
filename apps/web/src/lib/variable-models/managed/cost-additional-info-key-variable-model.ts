import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type {
    ListQuery, ListResponse, VariableModelLabel, IBaseVariableModel,
} from '@/lib/variable-models/_base/types';

import ErrorHandler from '@/common/composables/error/errorHandler';


export default class CostAdditionalInfoKeyVariableModel implements IBaseVariableModel {
    key = 'cost_additional_info_key';

    name = 'Cost Additional Info';

    labels = ['cost'] as VariableModelLabel[];

    #response: ListResponse = { results: [] };

    #fetcher = getCancellableFetcher(SpaceConnector.clientV2.costAnalysis.dataSource.list);

    async list(options: ListQuery = {}): Promise<ListResponse> {
        try {
            const query: Record<string, any> = {
                ...options,
                filter: [
                    {
                        key: 'cost_additional_info_keys',
                        value: null,
                        operator: 'not',
                    },
                ],
            };
            if (options.search) {
                query.filter.push({
                    key: 'cost_additional_info_keys',
                    value: options.search,
                    operator: 'contain',
                });
            }
            const { status, response } = await this.#fetcher({ query });
            if (status === 'succeed') {
                this.#response = response;
            }
            return this.#response;
        } catch (e) {
            ErrorHandler.handleError(e);
            return this.#response;
        }
    }
}
