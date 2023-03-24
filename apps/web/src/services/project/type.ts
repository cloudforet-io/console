import type { TreeItem, Tree } from '@spaceone/design-system/types/data-display/tree/type';

import type { TimeStamp } from '@/models';

export type ItemType = 'PROJECT_GROUP'|'PROJECT';

export interface ProjectGroupInfo {
    project_group_id: string;
    name: string;
    parent_project_group_info: null | ProjectGroupInfo;
    domain_id: string;
    created_by: string;
    created_at: TimeStamp;
    deleted_at: TimeStamp;
    tags: any;
}

export interface ProjectModel {
    project_id: string;
    name: string;
    state: string;
    project_group_info: ProjectGroupInfo;
    providers?: string[];
    created_by: string;
    created_at: TimeStamp;
    deleted_at: TimeStamp;
    tags: any;
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

export type ProjectTreeItem = TreeItem<ProjectItemResp>;

export type ProjectTreeRoot = Tree<ProjectItemResp>;

export type ProjectGroupTreeItem = Partial<ProjectTreeItem>;

export const SUMMARY_TYPE = {
    SERVER: 'Server',
    DATABASE: 'Database',
    STORAGE: 'Storage',
} as const;

export type SummaryType = typeof SUMMARY_TYPE[keyof typeof SUMMARY_TYPE];
