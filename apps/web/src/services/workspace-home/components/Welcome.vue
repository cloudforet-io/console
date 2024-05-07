<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PButton } from '@spaceone/design-system';

import { store } from '@/store';

const storeState = reactive({
    language: computed<string>(() => store.state.user.language),
    userName: computed<string>(() => store.state.user.name),
});

const handleClickButton = () => {
    window.open(`https://cloudforet.io/${storeState.language}/docs/guides/getting-started/`, '_blank');
};
</script>

<template>
    <div class="welcome">
        <span class="title">
            {{ !storeState.userName ? $t('HOME.WELCOME_TITLE') : $t('HOME.WELCOME_TITLE_USER_NAME', { 'user_name': storeState.userName}) }}😊
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
    min-height: 14.5rem;
    margin-bottom: 1rem;
    padding: 2rem 1.5rem;
    border-radius: 0.375rem;
    gap: 0.75rem;
    background-size: cover;
    background-image: url("@/assets/images/img_blurred-background.png");
    .title {
        @apply text-display-md text-violet-700;
    }
    .desc {
        @apply text-paragraph-lg text-gray-600 text-center;
        max-width: 40rem;
    }
    .explore-button {
        margin-top: 1rem;
    }

    @screen mobile {
        .title {
            @apply text-display-md;
        }
    }
}
</style>
