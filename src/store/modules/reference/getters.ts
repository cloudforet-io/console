import { Getter } from 'vuex';

import { ProjectReferenceMap } from '@/store/modules/reference/project/type';

export const projectItems: Getter<any, any> = (state): ProjectReferenceMap => state.project?.items ?? {};
