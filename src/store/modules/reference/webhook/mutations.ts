import { ResourceState, ResourceMap } from '@/store/modules/reference/type';

export const setWebhooks = (state: ResourceState, webhooks: ResourceMap): void => {
    state.items = webhooks;
};
