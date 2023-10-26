
import { camelCase, get } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type {
    ListResponse, VariableModelLabel, ListQuery, IResourceValueVariableModel,
    ResourceValueVariableModelConfig,
} from '@/lib/variable-models/_base/types';

import ErrorHandler from '@/common/composables/error/errorHandler';

export default class ResourceValueVariableModel implements IResourceValueVariableModel {
    key = '';

    name = '';

    labels: VariableModelLabel[] = [];

    resourceType = '';

    referenceKey = '';

    #response: ListResponse = { results: [] };

    readonly #fetcher?: ReturnType<typeof getCancellableFetcher<ListResponse>> = this.#getFetcher();

    constructor(config?: ResourceValueVariableModelConfig) {
        if (!config) return;
        if (!config.resource_type) throw new Error('resource_type is required');
        if (!config.reference_key) throw new Error('reference_key is required');
        if (config.name) this.name = config.name;
        this.resourceType = config.resource_type;
        this.referenceKey = config.reference_key;
        this.#fetcher = this.#getFetcher();
    }

    #getFetcher(): ReturnType<typeof getCancellableFetcher<ListResponse>>|undefined {
        if (!this.resourceType) return undefined;
        const apiPath = this.resourceType.split('.').map((d) => camelCase(d));

        const api = get(SpaceConnector.clientV2, apiPath);
        if (!api) throw new Error(`Invalid resourceType: ${this.resourceType}`);

        return getCancellableFetcher(api.stat);
    }

    #getParams(options: ListQuery = {}): Record<string, any> {
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
        if (options.limit) {
            query.page = {
                limit: options.limit,
            };
        }
        return {
            query,
        };
    }

    async list(options: ListQuery = {}): Promise<ListResponse> {
        try {
            if (!this.#fetcher) throw new Error('No fetcher');
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
