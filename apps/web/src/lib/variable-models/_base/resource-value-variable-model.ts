import { camelCase, get } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type {
    ListResponse, ListQuery, IResourceValueVariableModel,
} from '@/lib/variable-models/_base/types';

import ErrorHandler from '@/common/composables/error/errorHandler';


export default class ResourceValueVariableModel implements IResourceValueVariableModel {
    key = '';

    name = '';

    resourceType = '';

    referenceKey = '';

    #response: ListResponse = { results: [] };

    #fetcher?: ReturnType<typeof getCancellableFetcher<object, { results: string[], total_count: number }>>;

    constructor(config) {
        if (!config) return;
        if (!config.resource_type) throw new Error('resource_type is required');
        if (!config.reference_key) throw new Error('reference_key is required');
        if (config.name) this.name = config.name;
        this.resourceType = config.resource_type;
        this.referenceKey = config.reference_key;
        this.#fetcher = this.#getFetcher();
    }

    #getFetcher(): ReturnType<typeof getCancellableFetcher<object, { results: string[], total_count: number }>>|undefined {
        if (!this.resourceType) return undefined;
        const apiPath = this.resourceType.split('.').map((d) => camelCase(d));

        const api = get(SpaceConnector.clientV2, apiPath);
        if (!api) throw new Error(`Invalid resourceType: ${this.resourceType}`);

        return getCancellableFetcher(api.stat);
    }

    #getParams(query: ListQuery = {}): Record<string, any> {
        const _query: Record<string, any> = {
            distinct: this.referenceKey,
            filter: [
                {
                    key: this.referenceKey,
                    value: [null, ''],
                    operator: 'not_in',
                },
            ],
        };
        if (query.start !== undefined && query.limit !== undefined) {
            _query.page = {
                start: query.start,
                limit: query.limit,
            };
        }
        if (query.search) {
            _query.filter.push({
                key: this.referenceKey,
                value: query.search,
                operator: 'contain',
            });
        }
        if (query.filters) {
            _query.filter.push({
                key: this.referenceKey,
                value: query.filters,
                operator: 'in',
            });
        }
        return {
            query: _query,
        };
    }

    async list(query: ListQuery = {}): Promise<ListResponse> {
        try {
            if (!this.#fetcher) {
                this.#fetcher = this.#getFetcher();
                if (!this.#fetcher) return this.#response;
            }
            const { status, response } = await this.#fetcher(
                this.#getParams(query),
            );
            if (status === 'succeed') {
                let more = false;
                if (query.start !== undefined && query.limit !== undefined && response.total_count !== undefined) {
                    more = (query.start * query.limit) < response.total_count;
                }
                this.#response = {
                    results: response.results.map((value) => ({
                        key: value, name: value,
                    })),
                    more,
                };
            }
            return this.#response;
        } catch (e) {
            ErrorHandler.handleError(e);
            return this.#response;
        }
    }
}
