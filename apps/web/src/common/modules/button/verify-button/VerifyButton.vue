<script setup lang="ts">
import { PButton, PI } from '@spaceone/design-system';

import { emailValidator } from '@/lib/helper/user-validation-helper';

import { MODAL_TYPE } from '@/common/modules/modals/notification-email-modal/type';

interface Props {
    loading: boolean
    email: string
    verified?: boolean
    isAdministration?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    email: '',
    verified: false,
    isAdministration: false,
});

const emit = defineEmits<{(e: 'click-button', type: string): void }>();

/* API */
const handleClickVerifiedEmail = (type: string) => {
    emit('click-button', type);
};
</script>

<template>
    <div class="verify-button-wrapper">
        <div class="verify-button">
            <p-button v-if="props.verified"
                      style-type="tertiary"
                      :loading="props.loading"
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
                {{ $t('IDENTITY.USER.NOTIFICATION_EMAIL.CHANGE') }}
            </p-button>
            <p-button v-else
                      style-type="primary"
                      :disabled="!props.isAdministration && (props.email === '' || emailValidator(props.email))"
                      :loading="props.loading"
                      :size="props.isAdministration ? 'sm' : 'md'"
                      @click.prevent="handleClickVerifiedEmail(MODAL_TYPE.VERIFY)"
            >
                {{ $t('IDENTITY.USER.NOTIFICATION_EMAIL.SEND_MAIL') }}
            </p-button>
        </div>
        <slot />
    </div>
</template>

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
