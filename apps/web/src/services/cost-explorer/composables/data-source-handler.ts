import type { KeyItem } from '@spaceone/design-system/src/inputs/search/query-search/type';
import type { ValueHandler } from '@spaceone/design-system/types/inputs/search/query-search/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';
import { map } from 'lodash';

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

export const convertWorkspaceSearchValue = (options, workspaceList?: WorkspaceModel[]): ToolboxOptions => {
    const { queryTags } = options;
    if (!queryTags || queryTags.length === 0) return options;
    const workspaceOptionIndex = queryTags.findIndex((tag) => tag.key.name === 'workspace_id');
    const workspaceOption = queryTags[workspaceOptionIndex];
    const searchedWorkspace = workspaceList?.filter((workspace) => workspace.name.includes(workspaceOption.value.name))[0];
    if (searchedWorkspace) {
        queryTags[workspaceOptionIndex].value.name = searchedWorkspace.workspace_id;
    }
    return options;
};
