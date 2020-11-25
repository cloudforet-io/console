import { TreeItem } from '@/components/molecules/tree-node/type';
import { ProjectItemResp } from '@/views/project/project/type';

export type DataType = 'PROJECT'|'PROJECT_GROUP';

export interface ProjectGroup {
    id: string;
    name: string;
}

export interface Props {
    searchText: string;
    projectGroup: null|ProjectGroup;
}

export interface SearchResult {
    projectGroup: ProjectGroup|null;
    value: string;
}


export type ProjectTreeItem = TreeItem<ProjectItemResp>;
