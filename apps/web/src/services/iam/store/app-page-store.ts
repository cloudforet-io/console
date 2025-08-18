import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { RoleModel } from '@/api-clients/identity/role/schema/model';


export const useAppPageStore = defineStore('page-app', () => {
    const state = reactive({
        roles: [] as RoleModel[],
        modalInfo: {
            loading: false,
            type: '',
            title: '',
            themeColor: 'primary',
        },
        modalVisible: {
            form: false,
            status: false,
            apiKey: false,
            doubleCheck: false,
        },
    });

    const mutations = {
        setModalInfo(type: string, title: string, themeColor?: string) {
            state.modalInfo.type = type;
            state.modalInfo.title = title || '';
            state.modalInfo.themeColor = themeColor || 'primary';
        },
        setModalVisible(type: string, visible: boolean) {
            state.modalVisible[type] = visible;
        },
    };

    const actions = {
        resetModalInfo() {
            state.modalInfo.type = '';
            state.modalInfo.title = '';
            state.modalInfo.themeColor = 'primary';
        },
    };

    return {
        state,
        ...mutations,
        ...actions,
    };
});
