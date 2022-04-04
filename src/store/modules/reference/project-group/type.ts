import { ReferenceItem, ReferenceMap } from '@/store/modules/reference/type';

export interface ProjectGroupResourceItemData {
    parentGroupInfo?: {
        id: string;
        name: string;
    };
}

export type ProjectGroupResourceItem = ReferenceItem<ProjectGroupResourceItemData>

export type ProjectGroupResourceMap = ReferenceMap<ProjectGroupResourceItem>
