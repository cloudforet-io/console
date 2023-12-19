<script setup lang="ts">
import { reactive, watch } from 'vue';

import {
    PI, PTooltip, PFieldTitle, PToggleButton,
} from '@spaceone/design-system';

import { useProxyValue } from '@/common/composables/proxy-state';

interface Props {
    state?: string
    isChangedToggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    state: undefined,
    isChangedToggle: false,
});

const emit = defineEmits<{(e: 'update:isChangedToggle', type: string): void }>();

const state = reactive({
    isToggleActive: false,
    proxyIsChangedToggle: useProxyValue('isChangedToggle', props, emit),
});

const handleUpdateToggle = async () => {
    state.isToggleActive = false;
    state.proxyIsChangedToggle = true;
};

watch(() => props.state, (value) => {
    state.isToggleActive = value === 'ENABLED';
});
</script>

<template>
    <div class="multi-factor-auth-wrapper">
        <p-field-title :label="$t('IAM.USER.MAIN.MFA')">
            <template #left>
                <p-toggle-button
                    :value="state.isToggleActive"
                    :disabled="!state.isToggleActive"
                    class="toggle-button"
                    @change-toggle="handleUpdateToggle"
                />
            </template>
        </p-field-title>
        <p-tooltip
            :contents="$t('IAM.USER.MAIN.MFA_DESC')"
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
