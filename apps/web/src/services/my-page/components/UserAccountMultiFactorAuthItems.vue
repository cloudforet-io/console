<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { keyBy, mapValues } from 'lodash';

import { PI, PToggleButton, PBadge } from '@cloudforet/mirinae';

import { store } from '@/store';

import type { MultiFactorAuthType } from '@/services/my-page/types/multi-factor-auth-type';
import { MULTI_FACTOR_AUTH_ITEMS } from '@/services/my-page/types/multi-factor-auth-type';

interface Props {
    modalVisible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    modalVisible: false,
});
const emit = defineEmits<{(e: 'change-toggle', type: string, value: boolean): void }>();

const storeState = reactive({
    mfa: computed(() => store.state.user.mfa || undefined),
});
const state = reactive({
    enableMfa: mapValues(keyBy(MULTI_FACTOR_AUTH_ITEMS, 'type'), () => false) as Record<MultiFactorAuthType, boolean>,
    isVerified: computed<boolean>(() => storeState.mfa?.state === 'ENABLED'),
    type: computed<string>(() => storeState.mfa?.type),
    selectedType: '',
});

const handleChangeToggle = (type: string, value: boolean) => {
    state.selectedType = type;
    state.enableMfa[type] = value;
    emit('change-toggle', type, value);
};

watch(() => props.modalVisible, (modalVisible) => {
    if (!modalVisible) {
        state.enableMfa[state.selectedType] = state.type === state.selectedType ? state.isVerified : false;
        state.selectedType = '';
    }
}, { immediate: true });
</script>

<template>
    <div class="user-account-multi-factor-auth-items">
        <div v-for="(item, idx) in MULTI_FACTOR_AUTH_ITEMS"
             :key="`${item.type} - ${idx}`"
             class="user-account-multi-factor-auth-item"
        >
            <p-i class="icon"
                 :name="item.icon"
                 height="2rem"
                 width="2rem"
            />
            <div class="title-wrapper">
                <div class="toggle-wrapper">
                    <p-toggle-button :value="state.enableMfa[item.type]"
                                     @change-toggle="handleChangeToggle(item.type, $event)"
                    />
                    <p class="title">
                        {{ item.title }}
                    </p>
                    <p-badge style-type="green200"
                             badge-type="subtle"
                             class="badge"
                    >
                        {{ $t('MY_PAGE.MFA.SYNC') }}
                    </p-badge>
                </div>
                <p class="desc">
                    {{ item.desc }}
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.user-account-multi-factor-auth-items {
    @apply flex flex-col;
    gap: 1rem;
    .user-account-multi-factor-auth-item {
        @apply flex items-center border border-gray-200;
        padding: 1rem;
        border-radius: 0.375rem;
        gap: 1rem;
        .title-wrapper {
            @apply flex flex-col;
            gap: 0.5rem;
            .toggle-wrapper {
                @apply flex items-center;
                gap: 0.5rem;
                .title {
                    @apply text-label-lg font-bold;
                    margin-left: 0.5rem;
                }
            }
            .desc {
                @apply text-label-md text-gray-600;
            }
        }
    }
}
</style>
