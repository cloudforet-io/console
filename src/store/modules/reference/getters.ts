import type { Getter } from 'vuex';

import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';

export const projectItems: Getter<any, any> = (state): ProjectReferenceMap => state.project?.items ?? {};
