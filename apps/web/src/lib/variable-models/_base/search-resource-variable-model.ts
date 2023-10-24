
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import type { ApiFilter } from '@cloudforet/core-lib/space-connector/type';

import type {
    BaseVariableModelConfig, BaseListOptions, ListResponse,
    VariableModelType,
} from '@/lib/variable-models/_base/base-variable-model';
import { BaseVariableModel } from '@/lib/variable-models/_base/base-variable-model';

import ErrorHandler from '@/common/composables/error/errorHandler';


export interface SearchResourceVariableModelConfig extends BaseVariableModelConfig {
    resourceType: string;
    referenceKey?: string; // e.g. 'additional_info.Usage Type Details' (auto-complete/distinct api)
    resourceId?: string; // e.g. 'data_source_id' (auto-complete/resource api)
}
export interface SearchResourceListOptions extends BaseListOptions {
    filter?: ApiFilter[];
}

export class SearchResourceVariableModel extends BaseVariableModel<SearchResourceVariableModelConfig, SearchResourceListOptions> {
    modelType: VariableModelType = 'SEARCH_RESOURCE';

    resourceType: string; // e.g. 'cost_analysis.Cost'

    referenceKey?: string; // e.g. 'additional_info.Usage Type Details'

    resourceId?: string; // e.g. 'data_source_id'

    fetcher: ReturnType<typeof getCancellableFetcher<ListResponse>>;

    constructor(config: SearchResourceVariableModelConfig) {
        super(config);
        if (!config.resourceType) throw new Error('VariableModelSearchResourceConfig.resource_type is required');
        this.resourceType = config.resourceType;
        this.referenceKey = config.referenceKey;
        this.resourceId = config.resourceId;
        this.fetcher = this.getFetcher();
    }

    private getFetcher(): ReturnType<typeof getCancellableFetcher<ListResponse>> {
        if (this.referenceKey) return getCancellableFetcher(SpaceConnector.client.addOns.autocomplete.distinct);
        return getCancellableFetcher<ListResponse>(SpaceConnector.client.addOns.autocomplete.resource);
    }

    async list(options: SearchResourceListOptions = {}): Promise<ListResponse> {
        try {
            const { status, response } = await this.fetcher({
                resource_type: this.resourceType,
                options,
                distinct_key: this.referenceKey, // optional
            });
            if (status === 'succeed') {
                this.response = response;
            }
            return this.response;
        } catch (e) {
            ErrorHandler.handleError(e);
            return this.response;
        }
    }
}
