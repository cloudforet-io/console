import { reactive } from 'vue';

import { defineStore } from 'pinia';

export const useMyPageStore = defineStore('my-page', () => {
    const state = reactive({
        visibleUserNotification: false,
    });

    const mutations = {
        setVisibleUserNotification: (val: boolean) => {
            state.visibleUserNotification = val;
        },
    };

    return {
        state,
        ...mutations,
    };
});
