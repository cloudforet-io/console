import type { ReferenceHandler } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';
import type { CancelTokenSource } from 'axios';
import axios from 'axios';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

let resourceToken: CancelTokenSource | undefined;
const getResources = async (inputText: string, distinctKey: string, resourceType: string): Promise<{name: string; key: string}[]> => {
    if (resourceToken) {
        resourceToken.cancel('Next request has been called.');
        resourceToken = undefined;
    }

    resourceToken = axios.CancelToken.source();

    try {
        const { results } = await SpaceConnector.client.addOns.autocomplete.distinct({
            resource_type: resourceType,
            distinct_key: distinctKey,
            search: inputText,
            options: {
                limit: 10,
            },
        }, {
            cancelToken: resourceToken.token,
        });
        resourceToken = undefined;

        return results;
    } catch (e: any) {
        if (!axios.isCancel(e.axiosError)) {
            ErrorHandler.handleError(e);
        }

        return [];
    }
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getReferenceHandler = (): ReferenceHandler => async (inputText, schema, pageStart, pageLimit) => {
    if (!schema.reference) return { results: [] };
    const resources = await getResources(inputText, schema.reference.reference_key ?? schema.propertyName, schema.reference.resource_type);
    return {
        results: resources.map((resource) => ({ name: resource.key, label: resource.name })),
    };
};
