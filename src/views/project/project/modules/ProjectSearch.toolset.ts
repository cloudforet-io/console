import { TreeItem } from '@/components/molecules/tree/PTreeNode.toolset';
import { ProjectItemResp } from '@/lib/fluent-api/identity/project';
import { ProjectNodeState } from '@/lib/api/tree-node';

export type DataType = 'PROJECT'|'PROJECT_GROUP';

export interface ProjectGroup {
    id: string;
    name: string;
}

export interface Props {
    value: string;
    projectGroup: null|ProjectGroup;
}

export interface SearchResult {
    value: string;
    projectGroupId?: string;
}


export type ProjectTreeItem = TreeItem<ProjectItemResp, ProjectNodeState>;
