<template>
    <div
        class="sign-in-left-container"
    >
        <div class="lottie-wrapper">
            <img v-if="state.signInImage"
                 :src="state.signInImage"
            >
            <img v-else-if="state.showNewYearImage"
                 class="happy-new-year-2024"
                 src="/images/logos/happy-new-year-2024.png"
            >
            <lottie-vue-player v-else
                               autoplay
                               loop
                               src="/lottiefiles/lottie_floating-astronaut_signin.json"
                               :style="{ height: '100%', backgroundColor: 'transparent' }"
            />
        </div>
        <div class="version">
            <p-badge style-type="gray200"
                     badge-type="subtle"
                     shape="square"
            >
                {{ $t('COMMON.SIGN_IN.VERSION') }} {{ state.version }}
            </p-badge>
            <a :href="state.contactLink ? state.contactLink : 'mailto:support@cloudforet.io'"
               target="_blank"
            >
                <span class="text-blue-700 text-label-md">{{ $t('COMMON.SIGN_IN.CONTACT') }}</span>
            </a>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { PBadge } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { store } from '@/store';

import config from '@/lib/config';

const state = reactive({
    // eslint-disable-next-line no-undef
    version: VITE_APP_VER,
    signInImage: computed<string|undefined>(() => store.getters['domain/domainSignInImage']),
    contactLink: computed(() => config.get('CONTACT_LINK')),
    showNewYearImage: computed(() => {
        const currentDate = dayjs();
        const expiredDate = dayjs('2024-02-13');

        return currentDate.isBefore(expiredDate);
    }),
});
</script>

<style lang="postcss" scoped>
.sign-in-left-container {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 33%;
    height: 100%;

    .lottie-wrapper {
        @apply flex justify-center items-center;
        width: 80%;
        max-width: 42.625rem;
        margin: auto;
    }

    .version {
        position: relative;
        z-index: 100;
        display: inline-flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
        margin-left: 2.5rem;
        margin-bottom: 2.5rem;
        line-height: 140%;
    }

    @screen md {
        display: flex;
    }
}
</style>
