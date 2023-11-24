<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PI, PTooltip, PDivider, PButton,
} from '@spaceone/design-system';

import { store } from '@/store';

import { postDisableMfa } from '@/lib/helper/multi-factor-authentication-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

interface Props {
    email?: string
    type?: string
    isSentCode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    email: '',
    type: '',
    isSentCode: false,
});

const emit = defineEmits<{(e: 'update:is-sent-code'): void }>();

const state = reactive({
    loading: false,
    userId: computed(() => store.state.user.userId),
    domainId: computed(() => store.state.domain.domainId),
    proxyIsSentCode: useProxyValue('isSentCode', props, emit),
});

const handleClickSendCodeButton = async () => {
    state.loading = true;
    try {
        await postDisableMfa({
            user_id: state.userId,
            domain_id: state.domainId,
        });
        state.proxyIsSentCode = true;
    } finally {
        state.loading = false;
    }
};
</script>

<template>
    <div class="email-info-wrapper">
        <div v-if="props.type === 'change'"
             class="change-info-wrapper"
        >
            <div class="change-info">
                <p>{{ $t('COMMON.MFA_MODAL.CHANGE.DESC') }}</p>
                <p-tooltip
                    :contents="$t('COMMON.MFA_MODAL.CHANGE.TOOLTIP')"
                    position="bottom"
                >
                    <p-i name="ic_info-circle"
                         class="icon-info"
                         height="1rem"
                         width="1rem"
                         color="inherit"
                    />
                </p-tooltip>
            </div>
            <p-divider />
        </div>
        <div class="contents-wrapper">
            <div class="email-info">
                <p>{{ $t('COMMON.MFA_MODAL.SENT_DESC') }}</p>
                <div class="email-wrapper">
                    <p-i name="ic_envelope-filled"
                         height="0.875rem"
                         width="0.875rem"
                         color="inherit"
                         class="icon-envelope"
                    />
                    <p class="email-text">
                        {{ props.email }}
                    </p>
                </div>
            </div>
            <p-button v-if="props.type !== 'verify'"
                      style-type="secondary"
                      :loading="state.loading"
                      :disabled="state.proxyIsSentCode"
                      @click="handleClickSendCodeButton"
            >
                {{ $t('COMMON.MFA_MODAL.SEND_CODE') }}
            </p-button>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.email-info-wrapper {
    @apply flex flex-col bg-gray-100 rounded text-label-md text-gray-700;
    margin-bottom: 1rem;
    padding: 0.5rem;
    gap: 0.375rem;
    .change-info-wrapper {
        @apply flex flex-col;
        gap: 0.375rem;
        .change-info {
            @apply flex;
            gap: 0.25rem;
            .icon-info {
                @apply text-gray-900;
            }
        }
    }
    .contents-wrapper {
        @apply flex justify-between items-center;
        .email-info {
            @apply flex flex-col;
        }
        .email-wrapper {
            @apply flex items-center font-bold;
            gap: 0.375rem;
            .icon-envelope {
                margin-bottom: -0.25rem;
            }
        }
    }
}
</style>
