import { reactive } from 'vue';

import { defineStore } from 'pinia';


type modelType = 'FORM'|'RE_SYNC'|'DISABLED';
interface userAccountPageStoreState {
    selectedType: string,
    modalVisible: boolean,
    modalLoading: boolean,
    modalType: modelType,
}
export const useMultiFactorAuthenticationStore = defineStore('multi-factor-authentication-store', () => {
    const state = reactive<userAccountPageStoreState>({
        selectedType: '',
        modalVisible: false,
        modalLoading: false,
        modalType: 'FORM',
    });

    const mutations = {
        setSelectedType: (type: string) => {
            state.selectedType = type;
        },
        setModalVisible: (value: boolean) => {
            state.modalVisible = value;
        },
        setModalLoading: (value: boolean) => {
            state.modalLoading = value;
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
