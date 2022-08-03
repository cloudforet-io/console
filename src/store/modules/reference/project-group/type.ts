import type { ReferenceItem, ReferenceMap, ReferenceState } from '@/store/modules/reference/type';

export interface ProjectGroupResourceItemData {
    parentGroupInfo?: {
        id: string;
        name: string;
    };
}

export type ProjectGroupReferenceItem = Required<Pick<ReferenceItem<ProjectGroupResourceItemData>, 'label'|'name'|'data'>>;

export type ProjectGroupReferenceMap = ReferenceMap<ProjectGroupReferenceItem>;

export type ProjectGroupReferenceState = ReferenceState<ProjectGroupReferenceMap>;
