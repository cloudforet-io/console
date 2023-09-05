
import type { ReferenceHandler } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import ErrorHandler from '@/common/composables/error/errorHandler';

const getApi = (resourceType: string, referenceType: string, referenceKey?: string) => {
    const reference = REFERENCE_TYPE_INFO[referenceType];
    if (referenceKey && reference?.key === referenceKey) {
        return SpaceConnector.client.addOns.autocomplete.distinct;
    }
    return SpaceConnector.client.addOns.autocomplete.resource;
};

const getResources = async (inputText: string, resourceType: string, referenceType: string, distinctKey?: string): Promise<{name: string; key: string}[]> => {
    try {
        const fetcher = getCancellableFetcher(getApi(resourceType, referenceType, distinctKey));
        const { status, response } = await fetcher({
            resource_type: resourceType,
            search: inputText,
            options: {
                limit: 10,
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getReferenceHandler = (): ReferenceHandler => async (inputText, schema, pageStart, pageLimit) => {
    if (!schema.reference) return { results: [] };
    const resources = await getResources(inputText, schema.reference.resource_type, schema.propertyName, schema.reference.reference_key);
    return {
        results: resources.map((resource) => ({ name: resource.key, label: resource.name })),
    };
};
