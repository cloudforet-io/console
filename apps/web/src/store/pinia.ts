import { cloneDeep } from 'lodash';
import { createPinia } from 'pinia';

const resetStore = ({ store }) => {
    const initialState = cloneDeep(store.$state);
    store.$reset = () => store.$patch(cloneDeep(initialState));
};

export const pinia = createPinia();
pinia.use(resetStore);

