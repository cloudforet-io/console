<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PButton, PCollapsibleToggle } from '@spaceone/design-system';

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
            <p-button class="send-code-button"
                      @click.prevent="handleClickSendEmailButton"
            >
                <span class="emphasis">{{ $t('COMMON.MFA_MODAL.SEND_NEW_CODE') }}</span>
            </p-button>
        </p>
    </div>
</template>

<style scoped lang="postcss">
.collapsible-wrapper {
    margin-top: 2rem;
    .collapsed-contents {
        @apply text-paragraph-sm text-gray-500;
        .send-code-button {
            @apply text-label-xs font-normal text-blue-700;
            height: 1rem;
            background: initial;
            padding: 0;
            margin: 0;
            .emphasis:hover {
                text-decoration: underline;
            }
        }
    }
}
</style>
