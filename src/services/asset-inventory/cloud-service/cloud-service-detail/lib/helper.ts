import type { ValueHandler } from '@cloudforet/core-lib/component-util/query-search/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

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
