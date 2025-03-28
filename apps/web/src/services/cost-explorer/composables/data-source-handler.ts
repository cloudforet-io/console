import { cloneDeep, map } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { ApiFilter } from '@cloudforet/core-lib/space-connector/type';
import type { KeyItem, ValueHandler, KeyDataType } from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

import { DATASOURCE_STATE_COLOR } from '@/services/cost-explorer/constants/datasource-constant';

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
                resultMenuItems = resultMenuItems.filter((item) => item.label.toLowerCase().includes((inputText as string).toLowerCase()));
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
    key?: string,
    filters?: ApiFilter[],
): ValueHandler|undefined => {
    const staticParam: any = {
        resource_type: 'cost_analysis.DataSourceAccount',
        options: { limit: 10 },
        distinct_key: key,
    };

    return async (inputText: string|number, keyItem: KeyItem, currentDataType?: KeyDataType, subPath?: string) => {
        const param = cloneDeep(staticParam);
        param.search = inputText;
        if (subPath) {
            param.distinct_key = `${key}.${subPath}`;
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

    const updateTagValue = (index, newValue) => {
        if (index !== -1) {
            queryTags[index].value.name = newValue;
        }
    };

    const workspaceOptionIndex = queryTags.findIndex((tag) => tag.key?.name === 'workspace_id');
    const syncOptionIndex = queryTags.findIndex((tag) => tag.key?.name === 'is_sync');
    const linkedOptionIndex = queryTags.findIndex((tag) => tag.key?.name === 'is_linked');

    if (workspaceOptionIndex !== -1) {
        const workspaceOption = queryTags[workspaceOptionIndex];
        const searchedWorkspace = workspaceList?.filter((workspace) => workspace.name.toLowerCase().includes(workspaceOption.value.label.toLowerCase()));

        if (searchedWorkspace && searchedWorkspace?.length > 0) {
            updateTagValue(workspaceOptionIndex, searchedWorkspace[0].workspace_id);
        }
    }

    const booleanOptionIndices = [syncOptionIndex, linkedOptionIndex];
    booleanOptionIndices.forEach((index) => {
        if (index !== -1) {
            const name = queryTags[index]?.value.name;
            updateTagValue(index, name === 'true');
        }
    });

    return options;
};

const colorBindFactory = (colorMapping, textFnc) => (value) => ({
    text: textFnc(value),
    ...colorMapping[value],
});
export const datasourceStateFormatter = colorBindFactory(DATASOURCE_STATE_COLOR, (value) => value.toLowerCase());

