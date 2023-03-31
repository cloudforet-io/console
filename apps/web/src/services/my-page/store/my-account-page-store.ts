import { defineStore } from 'pinia';

// import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const useMyAccountPageStore = defineStore('my-account-page', {
    state: () => ({
        loading: false,
        userId: '',
        email: '',
    }),
    actions: {
        async sendValidationEmail(userId: string, email: string): Promise<void|Error> {
            console.log(userId, email);
            this.loading = true;
            try {
                // TODO: API 완성 후 연결
                // await SpaceConnector.clientV2.identity.user.verifyEmail({ userId, email });
                this.userId = userId;
                this.email = email;
            } catch (e: any) {
                ErrorHandler.handleError(e);
                throw e;
            } finally {
                this.loading = false;
            }
        },
    },
});
