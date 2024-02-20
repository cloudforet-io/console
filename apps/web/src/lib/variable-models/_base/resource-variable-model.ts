import { camelCase, get, isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type {
    ListResponse, ListQuery, IResourceVariableModel, IBaseVariableModel, ResourceVariableModelConfig,
} from '@/lib/variable-models/_base/types';

import ErrorHandler from '@/common/composables/error/errorHandler';


export default class ResourceVariableModel implements IResourceVariableModel {
    key = '';

    name = '';

    resourceType = '';

    idKey = '';

    nameKey = 'name';

    scope: IBaseVariableModel['scope'];

    labelsSchema: IBaseVariableModel['labelsSchema'];

    labels: IBaseVariableModel['labels'];

    protected _only?: string[];

    protected _searchTargets?: string[];

    #response: ListResponse = { results: [] };

    #fetcher?: ReturnType<typeof getCancellableFetcher<object, { results?: string[]; total_count?: number }>>;

    constructor(config?: ResourceVariableModelConfig) {
        if (!config) return;
        if (!config.resource_type) throw new Error('resource_type is required');
        if (config.name) this.name = config.name;
        this.resourceType = config.resource_type;
        this.#fetcher = this.#getFetcher();
    }

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

    get referenceKey(): string|undefined {
        if (isEmpty(this.labelsSchema) || isEmpty(this.labels)) return undefined;
        const referenceKey = Object.values(this.labelsSchema)?.find((d) => d.type === 'REFERENCE_KEY')?.key;
        if (!referenceKey) return undefined;
        return this.labels[referenceKey];
    }

    #getFetcher(): ReturnType<typeof getCancellableFetcher<object, { results?: string[]; total_count?: number }>>|undefined {
        if (!this.resourceType) return undefined;
        const apiPath = this.resourceType.split('.').map((d) => camelCase(d));

        const api = get(SpaceConnector.clientV2, apiPath);
        if (!api) throw new Error(`Invalid resourceType: ${this.resourceType}`);

        if (this.referenceKey) {
            return getCancellableFetcher(api.stat);
        }
        return getCancellableFetcher(api.list);
    }

    protected _getParams(query: ListQuery = {}): Record<string, any> {
        const _query: Record<string, any> = {
            filter: [
                {
                    key: this.referenceKey ?? this.idKey,
                    value: [null, ''],
                    operator: 'not_in',
                },
            ],
        };
        if (this.referenceKey) {
            _query.distinct = this.referenceKey;
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
        } else {
            _query.only = this.only;
            if (query.search) {
                _query.filter_or = this.searchTargets.map((key) => ({
                    k: key,
                    v: query.search,
                    o: 'contain',
                }));
            }
        }
        if (query.start !== undefined && query.limit !== undefined) {
            _query.page = {
                start: query.start,
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
                this._getParams(query),
            );
            if (status === 'succeed') {
                let more = false;
                if (query.start !== undefined && query.limit !== undefined && response.total_count !== undefined) {
                    more = (query.start * query.limit) < response.total_count;
                }
                this.#response = {
                    results: response.results ? response.results.map((d) => {
                        if (this.referenceKey) {
                            return { key: d, name: d };
                        }
                        return { key: d[this.idKey], name: this.nameFormatter(d) };
                    }) : [],
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
