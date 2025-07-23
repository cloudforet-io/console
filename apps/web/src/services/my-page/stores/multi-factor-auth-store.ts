import { reactive } from 'vue';

import { constant, mapValues } from 'lodash';
import { defineStore } from 'pinia';

import { MULTI_FACTOR_AUTH_TYPE } from '@/api-clients/identity/user-profile/schema/constant';


type modelType = 'FORM'|'RE_SYNC'|'DISABLED'|'SWITCH';
interface multiFactorAuthState {
    enableMfaMap: Record<string, boolean>,
    selectedType: string,
    modalVisible: boolean,
    modalInitLoading: boolean,
    modalType: modelType,
}

interface ModalState {
    OTPEnableModalVisible: boolean,
    OTPDisableModalVisible: boolean,
    emailEnableModalVisible: boolean,
    emailDisableModalVisible: boolean,
    OTPReSyncModalVisible: boolean,
    emailReSyncModalVisible: boolean,
    OTPSwitchModalVisible: boolean,
    emailSwitchModalVisible: boolean,
}

export const useMultiFactorAuthStore = defineStore('multi-factor-auth-store', () => {
    const state = reactive<multiFactorAuthState>({
        enableMfaMap: mapValues(MULTI_FACTOR_AUTH_TYPE, constant(false)),
        selectedType: '',
        modalVisible: false,
        modalInitLoading: false,
        modalType: 'FORM',
    });

    const modalState = reactive<ModalState>({
        OTPEnableModalVisible: false,
        OTPDisableModalVisible: false,
        emailEnableModalVisible: false,
        emailDisableModalVisible: false,
        OTPReSyncModalVisible: false,
        emailReSyncModalVisible: false,
        OTPSwitchModalVisible: false,
        emailSwitchModalVisible: false,
    });

    const mutations = {
        setEnableMfaMap: (map: Record<string, boolean>) => {
            state.enableMfaMap = map;
        },
        setEnableMfaMapType: (type: string, value: boolean) => {
            state.enableMfaMap[type] = value;
        },
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
        /* Modal Mutations */
        setOTPEnableModalVisible: (value: boolean) => {
            modalState.OTPEnableModalVisible = value;
        },
        setOTPDisableModalVisible: (value: boolean) => {
            modalState.OTPDisableModalVisible = value;
        },
        setEmailEnableModalVisible: (value: boolean) => {
            modalState.emailEnableModalVisible = value;
        },
        setEmailDisableModalVisible: (value: boolean) => {
            modalState.emailDisableModalVisible = value;
        },
        setOTPReSyncModalVisible: (value: boolean) => {
            modalState.OTPReSyncModalVisible = value;
        },
        setEmailReSyncModalVisible: (value: boolean) => {
            modalState.emailReSyncModalVisible = value;
        },
        setOTPSwitchModalVisible: (value: boolean) => {
            modalState.OTPSwitchModalVisible = value;
        },
        setEmailSwitchModalVisible: (value: boolean) => {
            modalState.emailSwitchModalVisible = value;
        },
    };

    const actions = {
        initState: () => {
            state.enableMfaMap = mapValues(MULTI_FACTOR_AUTH_TYPE, constant(false));
            state.selectedType = '';
            state.modalVisible = false;
            state.modalInitLoading = false;
            state.modalType = 'FORM';
        },
    };

    return {
        state,
        modalState,
        ...mutations,
        ...actions,
    };
});
