import { reactive } from '@vue/composition-api';

export const requestMetaReactive = () => reactive({
    sortBy: null,
    sortDesc: true,
    thisPage: 1,
    allPage: 1,
    pageSize: 15,
});
