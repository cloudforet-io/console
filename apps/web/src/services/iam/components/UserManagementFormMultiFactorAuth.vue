<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PI, PTooltip, PFieldTitle, PToggleButton,
} from '@spaceone/design-system';

import { useProxyValue } from '@/common/composables/proxy-state';

import { useUserPageStore } from '@/services/iam/store/user-page-store';
import type { UserListItemType } from '@/services/iam/types/user-type';

interface Props {
    isChangedToggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isChangedToggle: false,
});

const userPageStore = useUserPageStore();

const emit = defineEmits<{(e: 'update:is-changed-toggle', type: string): void }>();

const state = reactive({
    data: computed<UserListItemType>(() => userPageStore.selectedUsers[0]),
    isToggleActive: false,
    proxyIsChangedToggle: useProxyValue('isChangedToggle', props, emit),
});

const handleUpdateToggle = async () => {
    state.isToggleActive = false;
    state.proxyIsChangedToggle = true;
};

watch(() => state.data.mfa?.state, (value) => {
    state.isToggleActive = value === 'ENABLED';
}, { immediate: true });
</script>

<template>
    <div class="multi-factor-auth-wrapper">
        <div class="title-wrapper">
            <p-field-title :label="$t('IAM.USER.MAIN.MFA')" />
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
        <p-toggle-button
            :value="state.isToggleActive"
            :disabled="!state.isToggleActive"
            class="toggle-button"
            @change-toggle="handleUpdateToggle"
        />
    </div>
</template>

<style scoped lang="postcss">
.multi-factor-auth-wrapper {
    @apply flex items-center justify-between bg-white rounded-lg;
    padding: 0.75rem;
    .title-wrapper {
        @apply flex items-center;
        gap: 0.25rem;
    }
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
