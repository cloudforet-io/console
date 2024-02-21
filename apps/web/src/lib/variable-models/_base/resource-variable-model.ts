import {
    camelCase, get,
} from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type {
    ListResponse, ListQuery, IResourceVariableModel, IBaseVariableModel, ResourceVariableModelConfig,
    PropertyObject,
    PropertyOptions,
} from '@/lib/variable-models/_base/types';

import ErrorHandler from '@/common/composables/error/errorHandler';



export default class ResourceVariableModel<T> implements IResourceVariableModel<T> {
    key = '';

    name = '';

    resourceType = '';

    idKey = '';

    nameKey = 'name';

    scope: IBaseVariableModel['scope'];

    protected _only?: string[];

    protected _searchTargets?: string[];

    #response: ListResponse = { results: [] };

    #fetcher?: ReturnType<typeof getCancellableFetcher<object, { results?: string[]; total_count?: number }>>;

    constructor(config?: ResourceVariableModelConfig) {
        if (!config) return;
        // if (!config.resource_type) throw new Error('resource_type is required');
        // if (config.name) this.name = config.name;
        // this.resourceType = config.resource_type;
        this.#fetcher = this.#getFetcher();

        if (!config.options) return;
        Object.entries(config.options).forEach(([key, value]) => {
            if (!this[key]) return;
            this[key].fixedValue = value;
        });
    }


    nameFormatter(data: any): string {
        return data[this.nameKey];
    }

    protected generateProperty(options: PropertyOptions<T>): PropertyObject<T> {
        const {
            key,
            name,
            isDataKey = true,
            isFilter = true,
        } = options;

        const propertyObject: PropertyObject<T> = {
            key,
            name,
            isDataKey,
            isFilter,
            values: options.isDataKey ? this.stat(key as string) : undefined,
        };

        // TODO: keys method binding
        return propertyObject;
    }

    get only(): string[] {
        if (this._only) return this._only;
        return [this.idKey, this.nameKey];
    }

    get searchTargets(): string[] {
        if (this._searchTargets) return this._searchTargets;
        return [this.idKey, this.nameKey];
    }

    #getFetcher(dataKey?: string): ReturnType<typeof getCancellableFetcher<object, { results?: string[]; total_count?: number }>>|undefined {
        if (!this.resourceType) return undefined;
        const apiPath = this.resourceType.split('.').map((d) => camelCase(d));

        const api = get(SpaceConnector.clientV2, apiPath);
        if (!api) throw new Error(`Invalid resourceType: ${this.resourceType}`);

        if (dataKey) {
            return getCancellableFetcher(api.stat);
        }
        return getCancellableFetcher(api.list);
    }

    protected getStatParams(query: ListQuery = {}, dataKey: string): Record<string, any> {
        const _query: Record<string, any> = {
            filter: [
                {
                    key: dataKey,
                    value: [null, ''],
                    operator: 'not_in',
                },
            ],
        };
        _query.distinct = dataKey;
        if (query.search) {
            _query.filter.push({
                key: dataKey,
                value: query.search,
                operator: 'contain',
            });
        }
        if (query.filters) {
            _query.filter.push({
                key: dataKey,
                value: query.filters,
                operator: 'in',
            });
        }

        return {
            query: _query,
        };
    }

    protected _getParams(query: ListQuery = {}): Record<string, any> {
        const _query: Record<string, any> = {
            filter: [
                {
                    key: this.idKey,
                    value: [null, ''],
                    operator: 'not_in',
                },
            ],
        };
        _query.only = this.only;
        if (query.search) {
            _query.filter_or = this.searchTargets.map((key) => ({
                k: key,
                v: query.search,
                o: 'contain',
            }));
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
                    results: response.results ? response.results.map((d) => ({ key: d[this.idKey], name: this.nameFormatter(d) })) : [],
                    more,
                };
            }
            return this.#response;
        } catch (e) {
            ErrorHandler.handleError(e);
            return this.#response;
        }
    }

    stat(dataKey: string): (query?: ListQuery) => Promise<ListResponse> {
        const _dataKey = dataKey;
        return async (query: ListQuery = {}) => {
            try {
                if (!this.#fetcher) {
                    this.#fetcher = this.#getFetcher(_dataKey);
                    if (!this.#fetcher) return this.#response;
                }
                const { status, response } = await this.#fetcher(
                    this.getStatParams(query, _dataKey),
                );
                if (status === 'succeed') {
                    let more = false;
                    if (query.start !== undefined && query.limit !== undefined && response.total_count !== undefined) {
                        more = (query.start * query.limit) < response.total_count;
                    }
                    this.#response = {
                        results: response.results ? response.results.map((d) => ({ key: d, name: d })) : [],
                        more,
                    };
                }
                return this.#response;
            } catch (e) {
                ErrorHandler.handleError(e);
                return this.#response;
            }
        };
    }
}
