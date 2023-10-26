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

    only: string[] = [this.idKey, this.nameKey];

    searchTargets: string[] = [this.idKey, this.nameKey];

    #response: ListResponse = { results: [] };

    readonly #fetcher: ReturnType<typeof getCancellableFetcher<ListResponse>> = this.#getFetcher();

    formatter(data: any): string {
        return data[this.nameKey];
    }

    #getFetcher(): ReturnType<typeof getCancellableFetcher<ListResponse>> {
        const apiPath = this.resourceType.split('.').map((d) => camelCase(d));

        const api = get(SpaceConnector.clientV2, apiPath);
        if (!api) throw new Error(`Invalid resourceType: ${this.resourceType}`);

        return getCancellableFetcher(api.list);
    }

    #getParams(options: ListQuery = {}): Record<string, any> {
        const query: Record<string, any> = {
            ...options,
            filter: [
                {
                    key: this.idKey,
                    value: null,
                    operator: 'not',
                },
            ],
            only: this.only,
        };
        if (options.search) {
            query.filter_or = this.searchTargets.map((key) => ({
                k: key,
                v: options.search,
                o: 'contain',
            }));
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

    async list(options: ListQuery = {}): Promise<ListResponse> {
        try {
            const { status, response } = await this.#fetcher(
                this.#getParams(options),
            );
            if (status === 'succeed') {
                response.results = response.results.map((d) => ({
                    key: d[this.idKey],
                    name: this.formatter(d),
                }));
                this.#response = response;
            }
            return this.#response;
        } catch (e) {
            ErrorHandler.handleError(e);
            return this.#response;
        }
    }
}
