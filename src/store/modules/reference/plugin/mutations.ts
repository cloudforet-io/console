import { ResourceState, ResourceMap } from '@/store/modules/reference/type';

export const setPlugins = (state: ResourceState, plugins: ResourceMap): void => {
    state.items = plugins;
};
