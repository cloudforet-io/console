import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';

import type { UpdateUserRequest } from '@/store/modules/user/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { AUTH_ROUTE } from '@/services/auth/route-config';

export const usePasswordPageStore = defineStore('password-page', {
    state: () => ({
        loading: false,
        status: SpaceRouter.router.currentRoute.name,
    }),
    actions: {
        async postSendResetEmail(userId: string, domainId: string): Promise<void|Error> {
            this.loading = true;
            try {
                await SpaceConnector.clientV2.identity.user.resetPassword({ user_id: userId, domain_id: domainId });
                await SpaceRouter.router.replace({ name: AUTH_ROUTE.EMAIL._NAME, query: { userId, status: 'done' } }).catch(() => {});
            } catch (e: any) {
                ErrorHandler.handleError(e);
                await SpaceRouter.router.push({ name: AUTH_ROUTE.EMAIL._NAME, query: { userId, status: 'fail' } }).catch(() => {});
                throw e;
            } finally {
                this.loading = false;
            }
        },
        async postResetPassword(request: UpdateUserRequest): Promise<void|Error> {
            console.log(request);
            this.loading = true;
            try {
                // TODO: API 완성 후 연결
                // await SpaceConnector.clientV2.identity.user.update({ user_id: userId, password });
                // await SpaceRouter.router.replace({ name: AUTH_ROUTE.EMAIL._NAME, query: { status: 'done' } }).catch(() => {});
            } catch (e: any) {
                ErrorHandler.handleError(e);
                await SpaceRouter.router.push({ name: AUTH_ROUTE.EMAIL._NAME, query: { userId: request.user_id, status: 'fail' } }).catch(() => {});
                throw e;
            } finally {
                this.loading = false;
            }
        },
    },
});
