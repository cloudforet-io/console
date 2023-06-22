<template>
    <div class="verify-button-wrapper">
        <div class="verify-button">
            <p-button v-if="props.verified"
                      style-type="tertiary"
                      :loading="state.loading"
                      :size="props.isAdministration ? 'sm' : 'md'"
                      @click.prevent="handleClickVerifiedEmail(MODAL_TYPE.SEND)"
            >
                <p-i v-if="!props.isAdministration"
                     name="ic_edit"
                     height="1rem"
                     width="1rem"
                     color="inherit"
                     class="icon-edit"
                />
                {{ $t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.CHANGE') }}
            </p-button>
            <p-button v-else
                      style-type="primary"
                      :disabled="!props.isAdministration && (props.email === '' || emailValidator(props.email))"
                      :loading="state.loading"
                      :size="props.isAdministration ? 'sm' : 'md'"
                      @click.prevent="handleClickVerifiedEmail(MODAL_TYPE.VERIFY)"
            >
                {{ $t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.SEND_MAIL') }}
            </p-button>
        </div>
        <notification-email-modal
            :domain-id="props.domainId"
            :user-id="props.userId"
            :email="props.email"
            :modal-type="state.modalType"
            :visible.sync="state.isModalVisible"
            @refresh-user="handleGetUserDetailEmit"
        />
    </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { PButton, PI } from '@spaceone/design-system';

import { store } from '@/store';

import { emailValidator } from '@/lib/helper/user-validation-helper';
import { postValidationEmail } from '@/lib/helper/verify-email-helper';


import ErrorHandler from '@/common/composables/error/errorHandler';
import NotificationEmailModal from '@/common/modules/modals/notification-email-modal/NotificationEmailModal.vue';
import { MODAL_TYPE } from '@/common/modules/modals/notification-email-modal/type';

interface Props {
    email: string
    userId: string
    domainId: string
    verified: boolean
    isAdministration?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    email: '',
    userId: '',
    domainId: '',
    verified: false,
    isAdministration: false,
});

const emit = defineEmits<{(e: 'refresh-user', userId: string): void}>();

const state = reactive({
    loading: false,
    isModalVisible: false,
    modalType: '',
    loginUserId: computed(() => store.state.user.userId),
});
const handleGetUserDetailEmit = () => {
    emit('refresh-user', props.userId);
};

/* API */
const handleClickVerifiedEmail = async (type: string) => {
    state.loading = true;
    try {
        if (props.verified || state.modalType !== '') return;
        await postValidationEmail({
            user_id: props.userId,
            domain_id: props.domainId,
            email: props.email,
        });
        if (state.loginUserId === props.userId) {
            await store.dispatch('user/setUser', { email: props.email });
        }
    } catch (e: any) {
        ErrorHandler.handleError(e);
        throw e;
    } finally {
        state.isModalVisible = true;
        state.loading = false;
        state.modalType = type;
    }
};

/* Watcher */
watch(() => state.isModalVisible, (value) => {
    if (!value) {
        state.modalType = '';
    }
});
</script>

<style scoped lang="postcss">
.verify-button {
    /* custom design-system component - p-button */
    :deep(.p-button) {
        margin-left: 1rem;
        padding-right: 0.75rem;
        padding-left: 0.75rem;
    }
}
</style>
