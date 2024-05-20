import type { ValueHandler } from '@spaceone/design-system/types/inputs/search/query-search/type';
import { cloneDeep, keyBy } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { ApiFilter } from '@cloudforet/core-lib/space-connector/type';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';

export function convertDistinctValueHandler(
    filters?: ApiFilter[],
    workspaceList?: WorkspaceModel[],
): ValueHandler|undefined {
    const workspaceListMap = keyBy(workspaceList, 'workspace_id');

    const staticParam: any = {
        resource_type: 'cost_analysis.DataSourceAccount',
        options: { limit: 10 },
        distinct_key: 'workspace_id',
    };

    return async (inputText: string|number) => {
        const param = cloneDeep(staticParam);
        param.search = inputText;

        if (filters) {
            param.options.filter = filters;
        }

        try {
            const { results, total_count } = await SpaceConnector.client.addOns.autocomplete.distinct(param);

            const convertResults = results.map((i) => ({
                name: i.key,
                label: workspaceListMap[i.key] ? workspaceListMap[i.key].name : null,
            }));

            return {
                results: convertResults,
                totalCount: total_count,
            };
        } catch (e) {
            return {
                results: [],
                totalCount: 0,
            };
        }
    };
}
