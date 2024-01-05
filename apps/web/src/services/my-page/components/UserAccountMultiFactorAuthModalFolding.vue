<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PTextButton, PCollapsibleToggle } from '@spaceone/design-system';

import { store } from '@/store';

import { postUserProfileDisableMfa, postEnableMfa } from '@/lib/helper/multi-factor-auth-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

interface Props {
    mfaType?: string
    email?: string
    type: string
    isSentCode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    mfaType: '',
    email: '',
    type: '',
    isSentCode: false,
});

const emit = defineEmits<{(e: 'update:is-sent-code'): void }>();

const state = reactive({
    isCollapsed: true,
    userId: computed(() => store.state.user.userId),
    domainId: computed(() => store.state.domain.domainId),
    proxyIsSentCode: useProxyValue('is-sent-code', props, emit),
});

const handleClickSendEmailButton = async () => {
    if (props.type === 'disabled' || props.type === 'change') {
        const response = await postUserProfileDisableMfa();
        await store.dispatch('user/setUser', response);
    } else {
        await postEnableMfa({
            mfa_type: props.mfaType,
            options: {
                email: props.email,
            },
        }, true);
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
        }
    }
}
</style>
