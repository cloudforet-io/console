<script setup lang="ts">
import { reactive } from 'vue';

import {
    PI, PTooltip, PFieldTitle, PToggleButton,
} from '@spaceone/design-system';

import { useProxyValue } from '@/common/composables/proxy-state';

interface Props {
    isToggled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isToggled: undefined,
});

const emit = defineEmits<{(e: 'update:isToggled', type: string): void }>();

const state = reactive({
    proxyIsToggled: useProxyValue('isToggled', props, emit),
});

const handleUpdateToggle = async () => {
    state.proxyIsToggled = false;
};

</script>

<template>
    <div class="multi-factor-auth-wrapper">
        <p-field-title :label="$t('IDENTITY.USER.MAIN.MFA')">
            <template #left>
                <p-toggle-button
                    :value="state.proxyIsToggled"
                    :disabled="!state.proxyIsToggled"
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
