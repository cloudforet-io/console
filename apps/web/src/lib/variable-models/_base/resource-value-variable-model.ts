
import { camelCase, get } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type {
    ListResponse, VariableModelLabel, ListOptions, IResourceValueVariableModel,
} from '@/lib/variable-models/_base/types';

import ErrorHandler from '@/common/composables/error/errorHandler';

export class ResourceValueVariableModel implements IResourceValueVariableModel {
    key = '';

    name = '';

    labels: VariableModelLabel[] = [];

    resourceType = '';

    referenceKey = '';

    #response: ListResponse = { results: [] };

    readonly #fetcher: ReturnType<typeof getCancellableFetcher<ListResponse>> = this.#getFetcher();

    constructor(config?: IResourceValueVariableModel) {
        if (!config) return;
        if (!config.resourceType) throw new Error('ResourceValueVariableModelConfig.resourceType is required');
        this.resourceType = config.resourceType;
        this.referenceKey = config.referenceKey;
        this.#fetcher = this.#getFetcher();
    }

    #getFetcher(): ReturnType<typeof getCancellableFetcher<ListResponse>> {
        const apiPath = this.resourceType.split('.').map((d) => camelCase(d));

        const api = get(SpaceConnector.clientV2, apiPath);
        if (!api) throw new Error(`Invalid resourceType: ${this.resourceType}`);

        return getCancellableFetcher(api.stat);
    }

    #getParams(options: ListOptions = {}): Record<string, any> {
        const query: Record<string, any> = {
            distinct: this.referenceKey,
            filter: [
                {
                    key: this.referenceKey,
                    value: null,
                    operator: 'not',
                },
            ],
        };
        if (options.filter) {
            query.filter = query.filter.concat(options.filter);
        }
        if (options.limit) {
            query.page = {
                limit: options.limit,
            };
        }
        return {
            query,
        };
    }

    async list(options: ListOptions = {}): Promise<ListResponse> {
        try {
            const { status, response } = await this.#fetcher(
                this.#getParams(options),
            );
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
