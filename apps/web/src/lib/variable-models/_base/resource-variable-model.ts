import {
    camelCase, get,
} from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type {
    PropertyObject,
    ListResponse, ListQuery, IResourceVariableModel,
    PropertyOptions,
    ResourceVariableModelConstructorOptions, VariableModelConstructorConfig,
} from '@/lib/variable-models/_base/types';

import ErrorHandler from '@/common/composables/error/errorHandler';



export default class ResourceVariableModel<T=any> implements IResourceVariableModel<T> {
    meta: IResourceVariableModel['meta'] = {
        key: '',
        name: '',
        resourceType: '',
        idKey: '',
        nameKey: 'name',
    };

    #response: ListResponse = { results: [] };

    #fetcher?: ReturnType<typeof getCancellableFetcher<object, { results?: string[]; total_count?: number }>>;

    constructor(config: VariableModelConstructorConfig = {}, options?: ResourceVariableModelConstructorOptions) {
        if (config.key) this.meta.key = config.key;
        if (config.name) this.meta.name = config.name;
        if (config.resource_type) this.meta.resourceType = config.resource_type;
        if (config.id_key) this.meta.idKey = config.id_key;

        this.#fetcher = this.#getFetcher();

        if (!options) return;
        Object.entries(options.fixedOptions ?? {}).forEach(([key, value]) => {
            if (!this[key]) return;
            this[key].fixedValue = value;
        });
    }

    _properties: string[] = [];

    nameFormatter(data: any): string {
        return data[this.meta.nameKey];
    }

    protected generateProperty(options: PropertyOptions<T>): PropertyObject<T> {
        const _isDataKey = typeof options.isDataKey === 'boolean' ? options.isDataKey : true;
        const _isFilter = typeof options.isFilter === 'boolean' ? options.isFilter : true;
        const propertyObject: PropertyObject<T> = {
            key: options.key,
            name: options.name,
            isDataKey: _isDataKey,
            isFilter: _isFilter,
            values: _isDataKey ? this.stat(options.key as string) : undefined,
        };

        // TODO: keys method binding
        return propertyObject;
    }

    get only(): string[] {
        if (this.meta._only) return this.meta._only;
        return [this.meta.idKey, this.meta.nameKey];
    }

    get searchTargets(): string[] {
        if (this.meta._searchTargets) return this.meta._searchTargets;
        return [this.meta.idKey, this.meta.nameKey];
    }

    #getFetcher(dataKey?: string): ReturnType<typeof getCancellableFetcher<object, { results?: string[]; total_count?: number }>>|undefined {
        if (!this.meta.resourceType) return undefined;
        const apiPath = this.meta.resourceType.split('.').map((d) => camelCase(d));

        const api = get(SpaceConnector.clientV2, apiPath);
        if (!api) throw new Error(`Invalid resourceType: ${this.meta.resourceType}`);

        if (dataKey) {
            return getCancellableFetcher(api.stat);
        }
        return getCancellableFetcher(api.list);
    }

    protected _getStatParams(query: ListQuery = {}, dataKey: string): Record<string, any> {
        const apiQueryHelper = new ApiQueryHelper();

        apiQueryHelper.setFilters([
            { k: dataKey, v: [null, ''], o: '!=' },
        ]);

        if (query.search) {
            apiQueryHelper.addFilter({ k: dataKey, v: query.search, o: '' });
        }
        if (query.filters) {
            apiQueryHelper.addFilter({ k: dataKey, v: query.filters, o: '=' });
        }

        this._properties?.forEach((key) => {
            if (this[key]?.fixedValue) {
                apiQueryHelper.addFilter({ k: key, v: this[key].fixedValue, o: '=' });
            }
        });

        return {
            query: {
                distinct: dataKey,
                ...apiQueryHelper.data,
            },
        };
    }

    protected _getListParams(query: ListQuery = {}): Record<string, any> {
        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper.setFilters([
            { k: this.meta.idKey, v: [null, ''], o: '!=' },
        ]);

        if (query.search) {
            const orFilters = this.searchTargets.map((key) => ({
                k: key,
                v: query.search ?? '',
                o: '',
            }));
            apiQueryHelper.setOrFilters(orFilters);
        }
        if (query.start !== undefined && query.limit !== undefined) {
            apiQueryHelper.setPage(query.start, query.limit);
        }

        this._properties?.forEach((key) => {
            if (this[key]?.fixedValue) {
                apiQueryHelper.addFilter({ k: key, v: this[key].fixedValue, o: '=' });
            }
        });

        return {
            query: {
                only: this.only,
                ...apiQueryHelper.data,
            },
        };
    }

    async list(query: ListQuery = {}): Promise<ListResponse> {
        try {
            if (!this.#fetcher) {
                this.#fetcher = this.#getFetcher();
                if (!this.#fetcher) return this.#response;
            }
            const { status, response } = await this.#fetcher(
                this._getListParams(query),
            );
            if (status === 'succeed') {
                let more = false;
                if (query.start !== undefined && query.limit !== undefined && response.total_count !== undefined) {
                    more = (query.start * query.limit) < response.total_count;
                }
                this.#response = {
                    results: response.results ? response.results.map((d) => ({ key: d[this.meta.idKey], name: this.nameFormatter(d) })) : [],
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
                    this._getStatParams(query, _dataKey),
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
