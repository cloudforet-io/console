import { ResourceItem, ResourceMap } from '@/store/modules/reference/type';

export interface ProjectGroupResourceItemData {
    parentGroupInfo?: {
        id: string;
        name: string;
    };
}

export type ProjectGroupResourceItem = ResourceItem<ProjectGroupResourceItemData>

export type ProjectGroupResourceMap = ResourceMap<ProjectGroupResourceItem>
