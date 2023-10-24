import { getTextHighlightRegex } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type {
    ListOptions, ListResponse, VariableModelLabel, IBaseVariableModel,
} from '@/lib/variable-models/_base/types';

const DEFAULT_FIELDS = [
    { key: 'provider', name: 'Provider' },
    { key: 'project_id', name: 'Project' },
    { key: 'service_account_id', name: 'Service Account' },
    { key: 'project_group_id', name: 'Project Group' },
    { key: 'region_code', name: 'Region' },
    { key: 'cost_usage_type', name: 'Usage Type' },
    { key: 'cost_product', name: 'Product' },
];

export class CostDataFieldVariableModel implements IBaseVariableModel {
    key = 'cost_data_field';

    name = 'Cost Field';

    labels = ['cost'] as VariableModelLabel[];

    #response: ListResponse = { results: [] };

    dataSetKeys = ['default', 'additional_info', 'tags'];

    async list(options: ListOptions = {}): Promise<ListResponse> {
        if (!options.dataSetKey) {
            throw new Error('options.dataSetKey is required');
        }
        if (options.dataSetKey === 'default') {
            return this.#listDefault(options);
        }
        if (options.dataSetKey === 'additional_info') {
            return this.#listAdditionalInfo(options);
        }
        if (options.dataSetKey === 'tags') {
            return this.#listTags(options);
        }
        throw new Error(`Invalid dataSetKey: ${options.dataSetKey}. Valid values are ${this.dataSetKeys}`);
    }

    async #listDefault(options: ListOptions = {}): Promise<ListResponse> {
        if (!options.search) {
            this.#response = { results: DEFAULT_FIELDS };
        } else {
            const regex = getTextHighlightRegex(options.search);
            const results = DEFAULT_FIELDS.filter((item) => regex.test(item.name));
            this.#response = { results };
        }
        this.#response = { results: DEFAULT_FIELDS };
        return this.#response;
    }

    async #listAdditionalInfo(options: ListOptions = {}) {
        const query: Record<string, any> = {
            distinct_key: 'cost_additional_info_keys',
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
        if (options.filter) {
            query.filter = query.filter.concat(options.filter);
        }
        this.#response = await SpaceConnector.clientV2.costAnalysis.dataSource.stat({ query });
        return this.#response;
    }

    async #listTags(options: ListOptions = {}) {
        const query: Record<string, any> = {
            distinct_key: 'cost_tag_keys',
            filter: [
                {
                    key: 'cost_tag_keys',
                    value: null,
                    operator: 'not',
                },
            ],
        };
        if (options.search) {
            query.filter.push({
                key: 'cost_tag_keys',
                value: options.search,
                operator: 'contain',
            });
        }
        if (options.filter) {
            query.filter = query.filter.concat(options.filter);
        }
        this.#response = await SpaceConnector.clientV2.costAnalysis.dataSource.stat({ query });
        return this.#response;
    }
}
