<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PTextButton, PCollapsibleToggle } from '@spaceone/design-system';

import { store } from '@/store';

import { postEnableMfa } from '@/lib/helper/multi-factor-authentication-helper';

interface Props {
    mfaType?: string
    email?: string
}

const props = withDefaults(defineProps<Props>(), {
    mfaType: '',
    email: '',
});

const state = reactive({
    isCollapsed: true,
    userId: computed(() => store.state.user.userId),
    domainId: computed(() => store.state.domain.domainId),
});

const handleClickSendEmailButton = async () => {
    await postEnableMfa({
        user_id: state.userId,
        mfa_type: props.mfaType,
        options: {
            email: props.email,
        },
        domain_id: state.domainId,
    });
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
    margin-top: 2rem;
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
