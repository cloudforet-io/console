import type { ValueHandler } from '@cloudforet/core-lib/component-util/query-search/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { getApiActionByLayoutType } from '@/lib/component-util/dynamic-layout';

import type { CloudServiceDetailSchema } from '@/services/asset-inventory/cloud-service/cloud-service-detail/lib/type';

export const makeCustomValueHandler = (distinctKey: string, cloudServiceId: string): ValueHandler => async (inputText: string) => {
    try {
        const { results } = await SpaceConnector.client.addOns.autocomplete.distinct({
            resource_type: 'inventory.ChangeHistory',
            options: { filter: [{ k: 'cloud_service_id', v: cloudServiceId, o: 'eq' }] },
            distinct_key: distinctKey,
            search: inputText,
        });

        const filteredResults = results.filter((d) => d.key.includes(inputText));
        const filteredTotalCount = filteredResults.length;
        return {
            results: filteredResults.slice(0, 10).reduce((r, d) => {
                if (d.name !== '' && d.name !== undefined && d.name !== null) r.push({ label: d.name, name: d.key });
                return r;
            }, []),
            totalCount: filteredTotalCount,
        };
    } catch (e) {
        return {
            results: [],
            totalCount: 0,
        };
    }
};

// This is a helper function that extracts only the schema required for excel download from the metadata of the cloudService type.
export const filterForExcelSchema = (schemaList: CloudServiceDetailSchema[]) => schemaList.filter((schema: CloudServiceDetailSchema) => {
    if (schema.name === 'Base Information') return true;
    return getApiActionByLayoutType(schema.type) === 'getData';
});
