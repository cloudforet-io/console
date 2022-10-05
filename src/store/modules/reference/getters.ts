import type { Getter } from 'vuex';

import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';


export const projectItems: Getter<any, any> = (state): ProjectReferenceMap => state.project?.items ?? {};

export const projectGroupItems: Getter<any, any> = (state): ProjectGroupReferenceMap => state.projectGroup?.items ?? {};
