import type { ReferenceState, ReferenceMap } from '@/store/modules/reference/type';

export const setProjects = (state: ReferenceState, projects: ReferenceMap): void => {
    state.items = projects;
};
