<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PTextButton, PCollapsibleToggle } from '@cloudforet/mirinae';

import { MULTI_FACTOR_AUTH_TYPE } from '@/api-clients/identity/user-profile/schema/constant';

import { useUserStore } from '@/store/user/user-store';

import { postUserProfileDisableMfa, postEnableMfa } from '@/lib/helper/multi-factor-auth-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

interface Props {
    isDisabledModal: boolean
    isReSyncModal: boolean
    isSentCode: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isDisabledModal: false,
    isReSyncModal: false,
    isSentCode: false,
});

const emit = defineEmits<{(e: 'update:is-sent-code'): void }>();

const userStore = useUserStore();
const storeState = reactive({
    email: computed<string|undefined>(() => userStore.state.mfa?.options?.email),
});
const state = reactive({
    isCollapsed: true,
    proxyIsSentCode: useProxyValue('is-sent-code', props, emit),
});

const handleClickSendEmailButton = async () => {
    if (props.isDisabledModal || props.isReSyncModal) {
        await postUserProfileDisableMfa();
    } else {
        await postEnableMfa({
            mfa_type: MULTI_FACTOR_AUTH_TYPE.EMAIL,
            options: {
                email: storeState.email,
            },
        });
    }
    state.proxyIsSentCode = true;
};
</script>

<template>
    <div class="collapsible-wrapper">
        <p-collapsible-toggle v-if="state.isCollapsed"
                              v-model="state.isCollapsed"
        >
            {{ $t('COMMON.MFA_MODAL.COLLAPSE_TITLE') }}
        </p-collapsible-toggle>
        <p v-if="!state.isCollapsed"
           class="collapsed-contents"
        >
            {{ $t('COMMON.MFA_MODAL.COLLAPSE_DESC') }}
            <p-text-button class="send-code-button"
                           style-type="highlight"
                           :disabled="(props.isDisabledModal || props.isReSyncModal) ? !storeState.email : !props.isSentCode"
                           @click.prevent="handleClickSendEmailButton"
            >
                <span class="emphasis">{{ $t('COMMON.MFA_MODAL.SEND_NEW_CODE') }}</span>
            </p-text-button>
        </p>
    </div>
</template>

<style scoped lang="postcss">
.collapsible-wrapper {
    margin-top: 1.5rem;
    .collapsed-contents {
        @apply text-paragraph-sm text-gray-500;
        .send-code-button {
            @apply inline-block text-label-xs font-normal text-blue-700;
            margin-left: 0.25rem;
            padding: 0;
            &.disabled {
                @apply text-gray-400;
            }
        }
    }
}
</style>
