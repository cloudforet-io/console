import { ResourceState, ResourceMap } from '@/store/modules/resource/type';

export const setPlugins = (state: ResourceState, plugins: ResourceMap): void => {
    state.items = plugins;
};
