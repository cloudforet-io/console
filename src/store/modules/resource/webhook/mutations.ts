import { ResourceState, ResourceMap } from '@/store/modules/resource/type';

export const setWebhooks = (state: ResourceState, webhooks: ResourceMap): void => {
    state.items = webhooks;
};
