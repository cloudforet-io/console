import { getTextHighlightRegex } from '@spaceone/design-system';
import type { AutocompleteHandler } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type { EnumModelOptions, SearchResourceModelOptions } from '@/models/widget';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type {
    WidgetOptionsSchemaProperty,
} from '@/services/dashboards/widgets/_configs/widget-options-schema-config';

export const getWidgetOptionMenuHandlers = (schema: WidgetOptionsSchemaProperty): AutocompleteHandler[] => {
    if (!schema.item_options) return [];
    const handlers: AutocompleteHandler[] = [];
    try {
        schema.item_options.forEach((itemOption) => {
            if (itemOption.type === 'ENUM') {
                handlers.push(getEnumHandler(itemOption));
            } else if (itemOption.type === 'SEARCH_RESOURCE') {
                handlers.push(getSearchResourceHandler(itemOption));
            }
        });
    } catch (e) {
        console.error(e);
    }
    return handlers;
};

// eslint-disable-next-line no-undef
const getSearchResourceHandler = (options: SearchResourceModelOptions): AutocompleteHandler => {
    if (!options.resource_type) throw new Error('SearchResourceModelOptions.resource_type is required');
    if (options.reference_key) return getDistinctApiHandler(options);
    return getResourceApiHandler(options);
};
const getEnumHandler = (options: EnumModelOptions): AutocompleteHandler => {
    if (!options.values) throw new Error('EnumModelOptions.values is required');
    return (inputText: string) => {
        const regex = getTextHighlightRegex(inputText);
        const filtered = options.values.filter((item) => regex.test(item.label));
        return {
            results: filtered.map((item) => ({ name: item.key, label: item.label })),
            more: false,
        };
    };
};

const getResourceApiHandler = (options: SearchResourceModelOptions): AutocompleteHandler => {
    const fetcher = getCancellableFetcher(SpaceConnector.client.addOns.autocomplete.resource);
    let handlerResult: ReturnType<AutocompleteHandler> = {
        results: [],
    };
    return async (inputText, pageStart, pageLimit, filters) => {
        try {
            if (filters?.length && !options.resource_id) {
                console.warn('SearchResourceModelOptions.resource_id is required for filter');
            }
            const { status, response } = await fetcher({
                resource_type: options.resource_type,
                search: inputText,
                options: {
                    // TODO: update page start and limit if api is ready
                    limit: 10,
                    filter: (filters?.length && options.resource_id) ? [{
                        k: options.resource_id,
                        v: filters.map((f) => f.name),
                        o: 'in',
                    }] : undefined,
                },
            });

            if (status === 'succeed') {
                handlerResult = {
                    results: response.results.map((resource) => ({ name: resource.key, label: resource.name })),
                    more: response.more,
                };
            }

            return handlerResult;
        } catch (e) {
            ErrorHandler.handleError(e);
            return {
                results: [],
            };
        }
    };
};
const getDistinctApiHandler = (options: SearchResourceModelOptions): AutocompleteHandler => {
    if (!options.reference_key) throw new Error('SearchResourceModelOptions.reference_key is required for autocomplete/distinct api');
    const fetcher = getCancellableFetcher(SpaceConnector.client.addOns.autocomplete.distinct);
    let handlerResult: ReturnType<AutocompleteHandler> = {
        results: [],
    };
    return async (inputText, pageStart, pageLimit, filters) => {
        try {
            const { status, response } = await fetcher({
                resource_type: options.resource_type,
                search: inputText,
                options: {
                    // TODO: update page start and limit if api is ready
                    limit: 10,
                    filter: filters?.length ? [{
                        k: options.reference_key,
                        v: filters.map((f) => f.name),
                        o: 'in',
                    }] : undefined,
                },
                distinct_key: options.reference_key,
            });

            if (status === 'succeed') {
                handlerResult = {
                    results: response.results.map((d) => ({ name: d.key, label: d.name })),
                    more: response.more,
                };
            }

            return handlerResult;
        } catch (e) {
            ErrorHandler.handleError(e);
            return {
                results: [],
            };
        }
    };
};



