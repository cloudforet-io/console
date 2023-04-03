import { defineStore } from 'pinia';

// import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

// TODO: administration 이랑 API 겹침 > 글로벌로?
export const useMyAccountPageStore = defineStore('my-account-page', {
    state: () => ({
        loading: false,
        isModalVisible: false,
        userId: '',
        email: '',
    }),
    actions: {
        async postValidationEmail(userId: string, email: string): Promise<void|Error> {
            console.log(userId, email);
            this.loading = true;
            try {
                // TODO: API 완성 후 연결
                // await SpaceConnector.clientV2.identity.user.verifyEmail({ userId, email });
                this.userId = userId;
                this.email = email;
                if (!this.isModalVisible) {
                    this.isModalVisible = true;
                }
            } catch (e: any) {
                ErrorHandler.handleError(e);
                throw e;
            } finally {
                this.loading = false;
            }
        },
        async postValidationCode(code: string): Promise<void|Error> {
            console.log(code);
            this.loading = true;
            try {
                // TODO: API 완성 후 연결
                // await SpaceConnector.clientV2.identity.user.confirmEmail({ userId: this.userId, code });
                this.closeModal();
            } catch (e: any) {
                ErrorHandler.handleError(e);
                throw e;
            } finally {
                this.loading = false;
            }
        },
        closeModal() {
            this.isModalVisible = false;
        },
    },
});
