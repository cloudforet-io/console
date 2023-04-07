<template>
    <div>
        <div class="verify-button"
             :class="!props.isTableColumn ? 'block' : 'table-column'"
        >
            <p-button v-if="state.verified"
                      style-type="tertiary"
                      :loading="state.loading"
                      :size="props.isTableColumn ? 'sm' : 'md'"
                      @click.prevent="handleClickVerifiedEmail"
            >
                <p-i v-if="!props.isTableColumn"
                     name="ic_edit"
                     height="1rem"
                     width="1rem"
                     color="inherit"
                     class="icon-edit"
                />
                {{ $t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.CHANGE') }}
            </p-button>
            <p-button v-else
                      :disabled="!props.isTableColumn && (props.email === '' || !emailValidator(props.email))"
                      style-type="primary"
                      :loading="state.loading"
                      :size="props.isTableColumn ? 'sm' : 'md'"
                      @click.prevent="handleClickVerifiedEmail"
            >
                {{ $t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.VERIFY') }}
            </p-button>
        </div>
        <notification-email-modal
            :domain-id="props.domainId"
            :user-id="props.userId"
            :visible="state.isModalVisible"
        />
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PButton, PI } from '@spaceone/design-system';

import { store } from '@/store';

import { emailValidator } from '@/lib/helper/user-validation-helper';
import { postValidationEmail } from '@/lib/helper/verify-email-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import NotificationEmailModal from '@/common/modules/modals/NotificationEmailModal.vue';

interface IProps {
    email: string
    userId: string
    domainId: string
    isTableColumn?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
    email: '',
    userId: '',
    domainId: '',
    isTableColumn: false,
});

const state = reactive({
    loading: false,
    isModalVisible: false,
    verified: computed(() => store.state.user.emeilVerified),
});

/* API */
const handleClickVerifiedEmail = async () => {
    if (state.verified) {
        if (!state.isModalVisible) {
            state.isModalVisible = true;
        }
    } else {
        state.loading = true;
        try {
            if (!state.isModalVisible) {
                state.isModalVisible = true;
            }
            await postValidationEmail({
                userId: props.userId,
                email: props.email,
                domainId: props.domainId,
            });
        } catch (e: any) {
            ErrorHandler.handleError(e);
            throw e;
        } finally {
            state.loading = false;
        }
    }
};
</script>

<style scoped lang="postcss">
.verify-button {
    &.block {
        /* custom design-system component - p-button */
        :deep(.p-button) {
            margin-left: 1rem;
            padding-right: 0.75rem;
            padding-left: 0.75rem;
        }
    }
    &.table-column {
        @apply absolute;
        width: 3.75rem;
        height: 1.5rem;
        min-height: initial;
    }
}
</style>
