<script lang="ts" setup>

import { useRouter } from 'vue-router/composables';

import { PHeading, PButton } from '@cloudforet/mirinae';

import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';

const router = useRouter();

const handleClickConfirmButton = () => {
    router.push({ name: AUTH_ROUTE.SIGN_IN._NAME });
};
</script>

<template>
    <div class="multifactor-auth-configured flex flex-col items-center justify-center p-8 bg-white gap-6 w-full border border-gray-200 rounded-lg">
        <div class="flex flex-col items-center justify-center gap-2">
            <lottie-vue-player autoplay
                               src="/lottiefiles/lottie_done.json"
                               :style="{ height: '5rem', width: '5rem', backgroundColor: 'transparent' }"
            />
            <p-heading class="text-center">
                {{ $t('AUTH.MFA.MFA_CONFIGURED') }}
            </p-heading>
            <span class="text-center mt-2">
                {{ $t('AUTH.MFA.MFA_CONFIGURED_DESC') }}
            </span>
        </div>
        <p-button size="lg"
                  class="confirm-button"
                  @click="handleClickConfirmButton"
        >
            {{ $t('COMMON.EXPIRED_PAGE.SIGN_IN') }}
        </p-button>
    </div>
</template>

<style lang="postcss" scoped>
.multifactor-auth-configured {
    max-width: 28.5rem;
    align-self: center;
}
</style>
