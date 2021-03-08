import { TimeStamp } from '@/models';
import { TreeItem } from '@spaceone/design-system/dist/src/data-display/tree/tree-node/type';
import { RootTreeNode } from '@spaceone/design-system/dist/src/data-display/tree/type';

export type ItemType = 'PROJECT_GROUP'|'PROJECT'

export interface ProjectGroupInfo {
    // eslint-disable-next-line camelcase
    project_group_id: string;
    name: string;
    // eslint-disable-next-line camelcase
    parent_project_group_info: null | ProjectGroupInfo;
    domain_id: string;
    // eslint-disable-next-line camelcase
    created_by: string;
    // eslint-disable-next-line camelcase
    created_at: TimeStamp;
    // eslint-disable-next-line camelcase
    deleted_at: TimeStamp;
    tags: object;
}

export interface ProjectModel {
    project_id: string;
    name: string;
    state: string;
    // eslint-disable-next-line camelcase
    project_group_info: ProjectGroupInfo;
    providers?: string[];
    // eslint-disable-next-line camelcase
    created_by: string;
    // eslint-disable-next-line camelcase
    created_at: TimeStamp;
    // eslint-disable-next-line camelcase
    deleted_at: TimeStamp;
    tags: object;
}

export interface ProjectItemResp {
    id: string;
    name: string;
    item_type: ItemType;
    has_child?: boolean|null;
    has_permission?: boolean|null;
}


export interface ProjectGroup {
    id: string;
    name: string;
}


export type ProjectTreeItem = TreeItem<ProjectItemResp>

export type ProjectTreeRootItem = RootTreeNode<ProjectItemResp>

export interface FavoriteButtonProps {
    itemId: string;
    favoriteType: string;
    resourceType: string;
    itemMap: any;
    scale?: string;
    readOnly?: boolean;
}

export interface ProjectGroupTreeItem {
    node?: any;
    path?: number[];
}
