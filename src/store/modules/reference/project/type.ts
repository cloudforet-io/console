import { ReferenceItem, ReferenceMap } from '@/store/modules/reference/type';

export interface ProjectResourceItemData {
    groupInfo: {
        id: string;
        name: string;
    };
}

export type ProjectResourceItem = ReferenceItem<ProjectResourceItemData>

export type ProjectResourceMap = ReferenceMap<ProjectResourceItem>
