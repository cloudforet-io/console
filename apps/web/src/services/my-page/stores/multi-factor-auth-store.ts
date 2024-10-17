import { reactive } from 'vue';

import { defineStore } from 'pinia';


type modelType = 'FORM'|'RE_SYNC'|'DISABLED';
interface multiFactorAuthState {
    selectedType: string,
    modalVisible: boolean,
    modalInitLoading: boolean,
    modalType: modelType,
}
export const useMultiFactorAuthStore = defineStore('multi-factor-auth-store', () => {
    const state = reactive<multiFactorAuthState>({
        selectedType: '',
        modalVisible: false,
        modalInitLoading: false,
        modalType: 'FORM',
    });

    const mutations = {
        setSelectedType: (type: string) => {
            state.selectedType = type;
        },
        setModalVisible: (value: boolean) => {
            state.modalVisible = value;
        },
        setModalInitLoading: (value: boolean) => {
            state.modalInitLoading = value;
        },
        setModalType: (value: modelType) => {
            state.modalType = value;
        },
    };

    return {
        state,
        ...mutations,
    };
});
