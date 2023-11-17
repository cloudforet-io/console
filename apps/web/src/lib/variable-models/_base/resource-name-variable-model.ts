import { camelCase, get } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type {
    ListResponse, VariableModelLabel, ListQuery, IResourceNameVariableModel,
} from '@/lib/variable-models/_base/types';

import ErrorHandler from '@/common/composables/error/errorHandler';

export default class ResourceNameVariableModel implements IResourceNameVariableModel {
    key = '';

    name = '';

    labels: VariableModelLabel[] = [];

    resourceType = '';

    idKey = '';

    nameKey = 'name';

    protected _only?: string[];

    protected _searchTargets?: string[];

    #response: ListResponse = { results: [] };

    #fetcher?: ReturnType<typeof getCancellableFetcher<{ results?: string[]; total_count?: number }>>;

    nameFormatter(data: any): string {
        return data[this.nameKey];
    }

    get only(): string[] {
        if (this._only) return this._only;
        return [this.idKey, this.nameKey];
    }

    get searchTargets(): string[] {
        if (this._searchTargets) return this._searchTargets;
        return [this.idKey, this.nameKey];
    }

    #getFetcher(): ReturnType<typeof getCancellableFetcher<{ results?: string[]; total_count?: number }>>|undefined {
        if (!this.resourceType) return undefined;
        const apiPath = this.resourceType.split('.').map((d) => camelCase(d));

        const api = get(SpaceConnector.clientV2, apiPath);
        if (!api) throw new Error(`Invalid resourceType: ${this.resourceType}`);

        return getCancellableFetcher(api.list);
    }

    #getParams(query: ListQuery = {}): Record<string, any> {
        const _query: Record<string, any> = {
            filter: [
                {
                    key: this.idKey,
                    value: [null, ''],
                    operator: 'not_in',
                },
            ],
            only: this.only,
        };
        if (query.search) {
            _query.filter_or = this.searchTargets.map((key) => ({
                k: key,
                v: query.search,
                o: 'contain',
            }));
        }
        if (query.limit) {
            _query.page = {
                limit: query.limit,
            };
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
                if (query.start && query.limit && response.total_count) {
                    more = (query.start * query.limit) <= response.total_count;
                }
                this.#response = {
                    results: response.results ? response.results.map((d) => ({
                        key: d[this.idKey], name: this.nameFormatter(d),
                    })) : [],
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
