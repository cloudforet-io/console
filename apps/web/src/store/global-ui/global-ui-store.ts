import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { styleVariables } from '@cloudforet/mirinae';

export const useGlobalUIStore = defineStore('global-ui', () => {
    const gnbHeight = styleVariables['top-bar-height'];
    const state = reactive({
        topNotificationHeight: 0,
    });

    const getters = reactive({
        appBodyHeight: computed<string>(() => `calc(100vh - ${gnbHeight})`),
    });

    const actions = {
        setTopNotificationHeight(height: number) {
            state.topNotificationHeight = height;
        },
    };

    return {
        state,
        getters,
        ...actions,
    };
});
