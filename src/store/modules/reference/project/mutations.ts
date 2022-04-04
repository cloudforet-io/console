import { ResourceState, ResourceMap } from '@/store/modules/reference/type';

export const setProjects = (state: ResourceState, projects: ResourceMap): void => {
    state.items = projects;
};
