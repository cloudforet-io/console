
import type { ReferenceHandler, ReferenceHandlerOptions } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import { ASSET_VARIABLE_TYPE_INFO } from '@/lib/reference/asset-reference-config';
import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import ErrorHandler from '@/common/composables/error/errorHandler';


const getApi = ({ schemaProperty }: ReferenceHandlerOptions) => {
    const referenceKey = schemaProperty.reference?.reference_key;

    if (referenceKey) {
        return SpaceConnector.client.addOns.autocomplete.distinct;
    }
    return SpaceConnector.client.addOns.autocomplete.resource;
};


const filtersHelper = new QueryHelper();
const getResources = async (inputText: string, options: ReferenceHandlerOptions): Promise<{name: string; key: string}[]> => {
    try {
        const fetcher = getCancellableFetcher(getApi(options));

        const {
            propertyName, schemaProperty, filters, pageSize,
        } = options;
        const resourceType = schemaProperty.reference?.resource_type;
        const distinctKey = schemaProperty.reference?.reference_key;

        filtersHelper.setFilters([]);

        // NOTE: Some variables(asset) require specific API filters.
        if (schemaProperty.title === ASSET_VARIABLE_TYPE_INFO.asset_query_set.name) {
            filtersHelper.setFilters([{ k: 'ref_cloud_service_type.labels', o: '=', v: 'Compliance' }]);
        } else if (schemaProperty.title === ASSET_VARIABLE_TYPE_INFO.asset_account.name) {
            filtersHelper.setFilters([{ k: 'provider', o: '=', v: 'aws' }]);
        }

        if (filters?.length) {
            const resourceKey = distinctKey ?? REFERENCE_TYPE_INFO[propertyName]?.key;
            if (resourceKey) {
                filtersHelper.addFilter({ k: resourceKey, v: filters.map((d) => d.name as string), o: '=' });
            }
        }

        const { status, response } = await fetcher({
            resource_type: resourceType,
            search: inputText,
            options: {
                // TODO: update page start and limit if api is ready
                limit: pageSize ?? 10,
                filter: filtersHelper.apiQuery.filter,
            },
            distinct_key: distinctKey,
        });

        if (status === 'succeed') {
            return response.results;
        }
        return [];
    } catch (e: any) {
        ErrorHandler.handleError(e);
        return [];
    }
};
export const getReferenceHandler = (): ReferenceHandler => async (inputText, options) => {
    if (!options.schemaProperty.reference) return { results: [] };
    const resources = await getResources(inputText, options);
    return {
        results: resources.map((resource) => ({ name: resource.key, label: resource.name })),
    };
};
