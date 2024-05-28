import type { KeyItem } from '@spaceone/design-system/src/inputs/search/query-search/type';
import type { ValueHandler, KeyDataType } from '@spaceone/design-system/types/inputs/search/query-search/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';
import { cloneDeep, map } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { ApiFilter } from '@cloudforet/core-lib/space-connector/type';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';

export const makeDataSourceDistinctValueHandler = (
    filters?: ApiFilter[],
    workspaceList?: WorkspaceModel[],
): ValueHandler|undefined => {
    const workspaceListMap = map(workspaceList);

    return async (inputText: string|number) => {
        let resultMenuItems: KeyItem[] = [];
        try {
            resultMenuItems = workspaceListMap.map((i) => ({
                name: i.workspace_id,
                label: i.name,
            }));

            if (inputText) {
                resultMenuItems = resultMenuItems.filter((item) => item.label.includes(inputText as string));
            }

            return {
                results: resultMenuItems,
                totalCount: workspaceList?.length || 0,
            };
        } catch (e) {
            return {
                results: [],
                totalCount: 0,
            };
        }
    };
};

export const makeDataSourceSyncValueHandler = (
    filters?: ApiFilter[],
): ValueHandler|undefined => {
    const staticParam: any = {
        resource_type: 'cost_analysis.DataSourceAccount',
        options: { limit: 10 },
        distinct_key: 'is_sync',
    };

    return async (inputText: string|number, keyItem: KeyItem, currentDataType?: KeyDataType, subPath?: string) => {
        const param = cloneDeep(staticParam);
        param.search = inputText;
        if (subPath) {
            param.distinct_key = `'is_sync'.${subPath}`;
        }
        if (filters) {
            param.options.filter = filters;
        }

        try {
            const res = await SpaceConnector.client.addOns.autocomplete.distinct(param);

            return {
                results: res.results.reduce((results, d) => {
                    if (d.name !== '' && d.name !== undefined && d.name !== null) results.push({ label: d.name.toString(), name: d.key.toString() });
                    return results;
                }, []),
                totalCount: res.total_count,
            };
        } catch (e) {
            return {
                results: [],
                totalCount: 0,
            };
        }
    };
};

export const convertWorkspaceSearchValue = (options, workspaceList?: WorkspaceModel[]): ToolboxOptions => {
    const { queryTags } = options;
    if (!queryTags || queryTags.length === 0) return options;
    const workspaceOptionIndex = queryTags.findIndex((tag) => tag.key?.name === 'workspace_id');
    const syncOptionIndex = queryTags.findIndex((tag) => tag.key?.name === 'is_sync');
    if (workspaceOptionIndex !== -1) {
        const workspaceOption = queryTags[workspaceOptionIndex];
        const searchedWorkspace = workspaceList?.filter((workspace) => workspace.name.includes(workspaceOption.value.name))[0];
        if (searchedWorkspace) {
            queryTags[workspaceOptionIndex].value.name = searchedWorkspace.workspace_id;
        }
    } else if (syncOptionIndex !== -1) {
        const name = queryTags[syncOptionIndex]?.value.name;
        queryTags[syncOptionIndex].value.name = name === 'true';
    }

    return options;
};
