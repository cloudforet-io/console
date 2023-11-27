<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PI, PTooltip, PFieldTitle, PToggleButton,
} from '@spaceone/design-system';

import { store } from '@/store';

import { postDisableMfa } from '@/lib/helper/multi-factor-authentication-helper';

interface Props {
    state?: string
    userId?: string
    domainId?: string
}

const props = withDefaults(defineProps<Props>(), {
    state: undefined,
    userId: undefined,
    domainId: undefined,
});

const state = reactive({
    loginUserId: computed(() => store.state.user.userId),
    mfa: computed(() => store.state.user.mfa),
    isToggled: false,
});

const handleUpdateToggle = async () => {
    await postDisableMfa({
        user_id: props.userId,
        domain_id: props.domainId,
        force: true,
    });
    if (state.loginUserId === props.userId) {
        await store.dispatch('user/setUser', {
            mfa: {
                ...state.mfa,
                state: 'DISABLED',
            },
        });
    }
    state.isToggled = false;
};

watch(() => props.state, (value) => {
    state.isToggled = value === 'ENABLED';
});
</script>

<template>
    <div class="multi-factor-auth-wrapper">
        <p-field-title :label="$t('IDENTITY.USER.MAIN.MFA')">
            <template #left>
                <p-toggle-button
                    :value="state.isToggled"
                    :disabled="!state.isToggled"
                    class="toggle-button"
                    @change-toggle="handleUpdateToggle"
                />
            </template>
        </p-field-title>
        <p-tooltip
            :contents="$t('IDENTITY.USER.MAIN.MFA_DESC')"
            position="top"
            class="mfa-tooltip"
        >
            <p-i name="ic_info-circle"
                 class="icon-info"
                 height="1rem"
                 width="1rem"
                 color="inherit"
            />
        </p-tooltip>
    </div>
</template>

<style scoped lang="postcss">
.multi-factor-auth-wrapper {
    @apply flex items-center bg-white rounded-lg;
    padding: 0.75rem;
    gap: 0.25rem;
    .toggle-button {
        margin-right: 0.25rem;
    }
    .mfa-tooltip {
        margin-top: -0.25rem;
        .icon-info {
            @apply text-gray-500;
        }
    }
}
</style>
