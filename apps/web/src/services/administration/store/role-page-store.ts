import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RoleBindingListParameters } from '@/schema/identity/role-binding/api-verbs/list';
import type { RoleBindingModel } from '@/schema/identity/role-binding/model';
import type { RoleCreateParameters } from '@/schema/identity/role/api-verbs/create';
import type { RoleDeleteParameters } from '@/schema/identity/role/api-verbs/delete';
import type { RoleGetParameters } from '@/schema/identity/role/api-verbs/get';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import type { RoleUpdateParameters } from '@/schema/identity/role/api-verbs/update';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleModel } from '@/schema/identity/role/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface RolePageState {
    loading: boolean;
    roles: RoleModel[];
    totalCount: number;
    selectedIndices: number[];
}

export const useRolePageStore = defineStore('role-page', {
    state: (): RolePageState => ({
        loading: false,
        roles: [] as RoleModel[],
        totalCount: 0,
        selectedIndices: [] as number[],
    }),
    getters: {
        selectedRoles: (state) => state.selectedIndices.reduce((refined: RoleModel[], idx: number) => {
            if (state.roles[idx].role_type !== ROLE_TYPE.SYSTEM_ADMIN) {
                refined.push(state.roles[idx]);
            }
            return refined;
        }, []),
    },
    actions: {
        async listRoles(params: RoleListParameters) {
            this.loading = true;
            try {
                const { results, total_count } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>(params);
                this.roles = results || [];
                this.totalCount = total_count || 0;
                this.selectedIndices = [];
            } catch (e) {
                ErrorHandler.handleError(e);
                this.roles = [];
                this.totalCount = 0;
            } finally {
                this.loading = false;
            }
        },
        async getRoleDetail(params: RoleGetParameters) {
            try {
                return await SpaceConnector.clientV2.identity.role.get<RoleGetParameters, RoleModel>(params);
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        async createRole(params: RoleCreateParameters) {
            try {
                await SpaceConnector.clientV2.identity.role.create<RoleCreateParameters, RoleModel>(params);
            } catch (e: any) {
                ErrorHandler.handleRequestError(e, i18n.t('IAM.ROLE.FORM.ALT_E_CREATE_ROLE'));
                throw e;
            }
        },
        async updateRole(params: RoleUpdateParameters) {
            try {
                await SpaceConnector.clientV2.identity.role.update<RoleUpdateParameters, RoleModel>(params);
                showSuccessMessage(i18n.t('IAM.ROLE.FORM.ALT_S_UPDATE_ROLE'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('IAM.ROLE.FORM.ALT_E_UPDATE_ROLE'));
                throw e;
            }
        },
        async deleteRole(params: RoleDeleteParameters) {
            const { role_id } = params;
            try {
                await SpaceConnector.client.identity.role.delete({
                    role_id,
                });
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('IAM.ROLE.ALT_E_DELETE_ROLE'));
                throw e;
            }
        },
        //
        async listRoleBindings(params: RoleBindingListParameters) {
            try {
                const { results } = await SpaceConnector.clientV2.identity.roleBinding.list<RoleBindingListParameters, ListResponse<RoleBindingModel>>(params);
                return results || [];
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
    },
});
