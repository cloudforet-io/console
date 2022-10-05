import type { ReferenceItem, ReferenceMap } from '@/store/modules/reference/type';

export interface ProjectResourceItemData {
    groupInfo: {
        id: string;
        name: string;
    };
}

export type ProjectReferenceItem = Required<Pick<ReferenceItem<ProjectResourceItemData>, 'label'|'name'|'data'>>;

export type ProjectReferenceMap = ReferenceMap<ProjectReferenceItem>;

export interface ProjectReferenceState {
    items?: ProjectReferenceMap;
}
