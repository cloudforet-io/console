import { ResourceItem, ResourceMap } from '@/store/modules/resource/type';

export interface ProjectResourceItemData {
    groupInfo: {
        id: string;
        name: string;
    };
}

export type ProjectResourceItem = ResourceItem<ProjectResourceItemData>

export type ProjectResourceMap = ResourceMap<ProjectResourceItem>
