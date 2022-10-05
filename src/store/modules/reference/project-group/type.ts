import type { ReferenceItem, ReferenceMap } from '@/store/modules/reference/type';

export interface ProjectGroupResourceItemData {
    parentGroupInfo?: {
        id: string;
        name: string;
    };
}

export type ProjectGroupReferenceItem = Required<Pick<ReferenceItem<ProjectGroupResourceItemData>, 'key'|'label'|'name'|'data'>>;

export type ProjectGroupReferenceMap = ReferenceMap<ProjectGroupReferenceItem>;

export interface ProjectGroupReferenceState {
    items?: ProjectGroupReferenceMap;
}
