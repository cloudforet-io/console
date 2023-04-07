import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

// TODO: administration 이랑 API 겹침 > 글로벌로?
export const useMyAccountPageStore = defineStore('my-account-page', {
    state: () => ({
        loading: false,
        isModalVisible: false,
        isEditMode: false,
        email: '',
    }),
    actions: {
        async postValidationEmail(userId: string, domainId: string, email: string): Promise<void|Error> {
            this.loading = true;
            try {
                if (!this.isModalVisible) {
                    this.isModalVisible = true;
                }
                this.email = email;
                this.isEditMode = false;
                await SpaceConnector.clientV2.identity.user.verifyEmail({ user_id: userId, email, domain_id: domainId });
            } catch (e: any) {
                ErrorHandler.handleError(e);
                throw e;
            } finally {
                this.loading = false;
            }
        },
        async postValidationCode(userId: string, domainId: string, code: string): Promise<void|Error> {
            this.loading = true;
            try {
                await SpaceConnector.clientV2.identity.user.confirmEmail({ user_id: userId, verify_code: code, domain_id: domainId });
                this.handleCloseModal();
                // TODO: babel edit
                showSuccessMessage('success!!!!!', '');
            } catch (e: any) {
                ErrorHandler.handleError(e);
                throw e;
            } finally {
                this.loading = false;
            }
        },
        handleChangeValidationEmail(email: string) {
            if (!this.isModalVisible) {
                this.isModalVisible = true;
                this.email = email;
                this.handleSetEdit();
            }
        },
        handleCloseModal() {
            this.isModalVisible = false;
        },
        handleSetEdit() {
            this.isEditMode = true;
        },
    },
});
