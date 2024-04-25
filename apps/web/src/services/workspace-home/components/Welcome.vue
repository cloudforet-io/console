<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PButton } from '@spaceone/design-system';

import { store } from '@/store';

import type { RoleInfo } from '@/store/modules/user/type';

const storeState = reactive({
    userName: computed<RoleInfo>(() => store.state.user.name),
});

const handleClickButton = () => {
    window.open('https://cloudforet.io/{language_code}/docs/guides/getting-started/', '_blank');
};
</script>

<template>
    <div class="welcome">
        <span class="title">
            {{ $t('HOME.WELCOME_TITLE') }}
            <span v-if="storeState.userName">, {{ storeState.userName }}</span>
            😊
        </span>
        <span class="desc">{{ $t('HOME.WELCOME_DESC') }}</span>
        <p-button icon-left="ic_rocket-filled"
                  class="explore-button"
                  @click="handleClickButton"
        >
            <span>{{ $t('HOME.WELCOME_BUTTON') }}</span>
        </p-button>
    </div>
</template>

<style scoped lang="postcss">
.welcome {
    @apply flex flex-col items-center justify-center bg-violet-150 border border-violet-200;
    height: 14.5rem;
    margin-bottom: 1rem;
    border-radius: 0.375rem;
    gap: 0.75rem;
    background-size: cover;
    background-image: url("@/assets/images/img_blurred-background.png");
    .title {
        @apply text-display-lg text-violet-700;
    }
    .desc {
        @apply text-paragraph-lg text-gray-600;
    }
    .explore-button {
        margin-top: 1rem;
    }
}
</style>
