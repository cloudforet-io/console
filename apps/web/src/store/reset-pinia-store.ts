import { cloneDeep } from 'lodash';

export const resetStore = ({ store }) => {
    const initialState = cloneDeep(store.$state);
    store.$reset = () => store.$patch(cloneDeep(initialState));
};
