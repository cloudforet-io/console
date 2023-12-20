import { computed, reactive } from 'vue';

import { styleVariables } from '@spaceone/design-system';
import { defineStore } from 'pinia';

export const useGlobalUIStore = defineStore('global-ui', () => {
    const gnbHeight = styleVariables['gnb-height'];
    const state = reactive({
        topNotificationHeight: 0,
    });

    const getters = reactive({
        appBodyHeight: computed<string>(() => `calc(100vh - ${state.topNotificationHeight}px - ${gnbHeight})`),
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
