import { reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { ROLE_STATE } from '@/api-clients/identity/role/constant';
import type { RoleListParameters } from '@/api-clients/identity/role/schema/api-verbs/list';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

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
            state.modalInfo.title = title;
            state.modalInfo.themeColor = themeColor || 'primary';
        },
        setModalVisible(type: string, visible: boolean) {
            state.modalVisible[type] = visible;
        },
    };

    const actions = {
        resetModal() {
            state.modalInfo.type = '';
            state.modalInfo.title = '';
            state.modalInfo.themeColor = 'primary';
            state.modalVisible.form = false;
            state.modalVisible.status = false;
            state.modalVisible.apiKey = false;
            state.modalVisible.doubleCheck = false;
        },
        async listRoles() {
            try {
                const { results } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>({
                    query: {
                        filter: [
                            { k: 'state', v: ROLE_STATE.ENABLED, o: 'eq' },
                        ],
                    },
                });
                state.roles = results || [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.roles = [];
            }
        },
    };

    return {
        state,
        ...mutations,
        ...actions,
    };
});
