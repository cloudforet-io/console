import { get } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { Query, Sort } from '@cloudforet/core-lib/space-connector/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProjectGroupListParameters } from '@/schema/identity/project-group/api-verbs/list';
import type { ProjectGroupModel } from '@/schema/identity/project-group/model';
import type { ProjectListParameters } from '@/schema/identity/project/api-verbs/list';
import type { ProjectModel } from '@/schema/identity/project/model';

import type { ProjectTreeItemType, ProjectTreeNodeData } from '@/services/project/types/project-tree-type';


type ProjectGroupListResponse = ListResponse<ProjectGroupModel>;
type ProjectListResponse = ListResponse<ProjectModel>;
type ListRequestParams = ProjectGroupListParameters | ProjectListParameters;
export interface ProjectTreeOptions {
    item_type: ProjectTreeItemType;
    item_id?: string;
    check_child?: boolean;
    exclude_type?: ProjectTreeItemType;
    query?: Query;
    sort?: Sort;
}
interface ProjectTreeSearchOptions {
    item_type?: ProjectTreeItemType;
    item_id?: string;
    query?: Query;
    sort?: Sort;
}
interface ProjectTreeSearchResponse {
    open_path: string[];
}


const fetchProjectGroupChildMap = async (groups: ProjectGroupModel[]): Promise<Record<string, boolean>> => {
    const res = {};

    const { results: allChildren } = await SpaceConnector.clientV2.identity.projectGroup.list<ProjectGroupListParameters, ProjectGroupListResponse>({
        query: {
            only: ['parent_group_id'],
            filter: [{
                k: 'parent_group_id',
                v: groups.map((d) => d.project_group_id),
                o: 'in',
            }],
        },
    });

    allChildren?.forEach((d) => {
        if (d.parent_group_id) {
            res[d.parent_group_id] = true;
        }
    });

    return res;
};
const fetchProjectChildMap = async (groups: ProjectGroupModel[]): Promise<Record<string, boolean>> => {
    const res: Record<string, boolean> = {};

    const { results: allChildren } = await SpaceConnector.clientV2.identity.project.list<ListRequestParams, ProjectListResponse>({
        query: {
            only: ['project_group_id'],
            filter: [{
                k: 'project_group_id',
                v: groups.map((d) => d.project_group_id),
                o: 'in',
            }],
        },
    });

    allChildren?.forEach((d) => {
        res[d.project_group_id] = true;
    });

    return res;
};
const getChildMap = async (groups: ProjectGroupModel[], excludeType: ProjectTreeItemType): Promise<Record<string, boolean>> => {
    let res = {};

    if (excludeType !== 'PROJECT') {
        res = { ...res, ...await fetchProjectChildMap(groups) };
    }
    if (excludeType !== 'PROJECT_GROUP') {
        res = { ...res, ...await fetchProjectGroupChildMap(groups) };
    }

    return res;
};
const fetchProjectGroups = async (params): Promise<ProjectTreeNodeData[]> => {
    const requestParams: ProjectGroupListParameters = {
        query: params.query ?? {},
    };

    if (params.item_type === 'ROOT') {
        (requestParams as Required<ListRequestParams>).query.filter = [
            ...requestParams.query?.filter ?? [],
            {
                k: 'parent_group_id',
                v: null,
                o: 'eq',
            },
        ];
    } else {
        requestParams.parent_group_id = params.item_id;
    }

    const { results } = await SpaceConnector.clientV2.identity.projectGroup.list<ProjectGroupListParameters, ProjectGroupListResponse>(requestParams);
    if (!results?.length) return [];

    let childMap = {};
    if (params.check_child) {
        childMap = await getChildMap(results, params.exclude_type);
    }

    return results.map((d) => {
        const item: ProjectTreeNodeData = {
            id: d.project_group_id,
            name: d.name,
            item_type: 'PROJECT_GROUP',
            has_child: null,
        };

        if (params.check_child) {
            item.has_child = !!childMap[d.project_group_id];
        }

        return item;
    });
};
const fetchProjects = async (params): Promise<ProjectTreeNodeData[]> => {
    if (params.item_type === 'ROOT') {
        return [];
    }

    const { results } = await SpaceConnector.clientV2.identity.project.list<ProjectListParameters, ProjectListResponse>({
        query: params.query,
        project_group_id: params.item_id || null,
    });
    if (!results?.length) return [];

    const items: ProjectTreeNodeData[] = [];

    results.forEach((itemInfo) => {
        const item: ProjectTreeNodeData = {
            id: itemInfo.project_id,
            name: itemInfo.name,
            item_type: 'PROJECT',
            has_child: false,
        };
        items.push(item);
    });

    return items;
};
const getParentItem = async (itemId: string, itemType: ProjectTreeItemType, openItems: string[] = []): Promise<string[]> => {
    if (itemType === 'PROJECT') {
        const response = await SpaceConnector.clientV2.identity.project.list<ProjectListParameters, ProjectListResponse>({
            project_id: itemId,
        });

        if (response.total_count === 1) {
            const projectInfo = response?.results?.[0];
            if (projectInfo) openItems.unshift(projectInfo.project_id);

            const parentItemId = get(projectInfo, 'project_group_info.project_group_id');
            if (parentItemId) await getParentItem(parentItemId, 'PROJECT_GROUP', openItems);
        }
    } else {
        const response = await SpaceConnector.clientV2.identity.projectGroup.list<ProjectGroupListParameters, ProjectGroupListResponse>({
            project_group_id: itemId,
        });

        if (response.total_count === 1) {
            const projectGroupInfo = response?.results?.[0];
            if (projectGroupInfo) openItems.unshift(projectGroupInfo.project_group_id);

            const parentItemId = get(projectGroupInfo, 'parent_group_id');
            if (parentItemId) await getParentItem(parentItemId, 'PROJECT_GROUP', openItems);
        }
    }
    return openItems;
};


const getProjectTree = async (options: ProjectTreeOptions): Promise<ProjectTreeNodeData[]> => {
    if (!options.item_type) {
        throw new Error('Required Parameter. (key = item_type)');
    }

    if (options.item_type !== 'ROOT' && !options.item_id) {
        throw new Error('Required Parameter. (key = item_id)');
    }

    if (!options.query) {
        options.query = {};
    }
    options.query.minimal = true;

    if (options.sort) {
        options.query.sort = options.sort;
    }

    const treeItems: ProjectTreeNodeData[] = [];

    if (options.exclude_type !== 'PROJECT_GROUP') {
        Array.prototype.push.apply(treeItems, await fetchProjectGroups(options));
    }
    if (options.exclude_type !== 'PROJECT') {
        Array.prototype.push.apply(treeItems, await fetchProjects(options));
    }

    return treeItems;
};
const getProjectTreeSearchPath = async (options: ProjectTreeSearchOptions): Promise<ProjectTreeSearchResponse> => {
    if (!options.item_type) {
        throw new Error('Required Parameter. (key = item_type)');
    }

    if (['PROJECT_GROUP', 'PROJECT'].indexOf(options.item_type) === -1) {
        throw new Error(`Invalid item type. (key = item_type) : ${options.item_type}`);
    }

    if (options.item_type !== 'ROOT' && !options.item_id) {
        throw new Error('Required Parameter. (key = item_id)');
    }

    if (!options.query) {
        options.query = {};
    }
    options.query.minimal = true;

    if (options.sort) {
        options.query.sort = options.sort;
    }

    const response: ProjectTreeSearchResponse = {
        open_path: [],
    };

    response.open_path = await getParentItem(
        options.item_id as string,
        options.item_type,
    );

    return response;
};

export const useProjectTree = () => ({
    getProjectTree,
    getProjectTreeSearchPath,
});

