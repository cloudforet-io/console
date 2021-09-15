import { TimeStamp } from '@/models';
import { TreeItem, Tree } from '@spaceone/design-system/dist/src/data-display/tree/type';
import { MAINTENANCE_WINDOW_STATE } from '@/services/project/project-detail/project-alert-manager/project-maintenance-window/lib/config';

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

export type ProjectTreeRoot = Tree<ProjectItemResp>

export type ProjectGroupTreeItem = Partial<ProjectTreeItem>


export type MAINTENANCE_WINDOW_STATE = typeof MAINTENANCE_WINDOW_STATE[keyof typeof MAINTENANCE_WINDOW_STATE]
