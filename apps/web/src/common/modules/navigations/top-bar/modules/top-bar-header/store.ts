import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import type { Breadcrumb } from '@/common/modules/page-layouts/type';

interface TopBarHeaderStoreState {
    breadcrumbs: Breadcrumb[];
    selectedItem: Breadcrumb;
    id?: string;
}

export const useTopBarHeaderStore = defineStore('top-bar-header', () => {
    const state = reactive<TopBarHeaderStoreState>({
        breadcrumbs: [],
        selectedItem: {} as Breadcrumb,
        id: '',
    });

    const getters = reactive({
        breadcrumbs: computed<Breadcrumb[]>(() => {
            const { breadcrumbs } = useBreadcrumbs();
            return state.breadcrumbs.length === 0 ? breadcrumbs.value : state.breadcrumbs;
        }),
        selectedItem: computed<Breadcrumb>(() => state.selectedItem),
        id: computed<string|undefined>(() => state.id),
    });

    const actions = {
        setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => {
            state.breadcrumbs = breadcrumbs;
        },
        setId: (id?: string) => {
            state.id = id;
        },

        setSelectedItem: (item: Breadcrumb) => {
            state.selectedItem = item;
        },
        initState: () => {
            state.breadcrumbs = [];
            state.id = '';
        },
    };


    return {
        state,
        getters,
        ...actions,
    };
});
