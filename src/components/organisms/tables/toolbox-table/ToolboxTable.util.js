import { reactive } from '@vue/composition-api';

export const requestMetaReactive = reactive({
    sortBy: null,
    sortDesc: true,
    thisPage: 1,
    allPage: 10,
    pageSize: 15,
});
