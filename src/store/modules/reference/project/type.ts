import type { ReferenceItem, ReferenceMap } from '@/store/modules/reference/type';

export interface ProjectResourceItemData {
    groupInfo: {
        id: string;
        name: string;
    };
}

export type ProjectReferenceItem = Required<Pick<ReferenceItem<ProjectResourceItemData>, 'key'|'label'|'name'|'data'>>;

export type ProjectReferenceMap = ReferenceMap<ProjectReferenceItem>;

export interface ProjectReferenceState {
    items?: ProjectReferenceMap;
}
