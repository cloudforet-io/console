import { ResourceState, ResourceMap } from '@/store/modules/resource/type';

export const setProjects = (state: ResourceState, projects: ResourceMap): void => {
    state.items = projects;
};
