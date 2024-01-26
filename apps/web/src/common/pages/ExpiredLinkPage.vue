<script setup lang="ts">
import { useRouter } from 'vue-router/composables';

import { PButton, PI } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { ROOT_ROUTE } from '@/router/constant';

import { gray } from '@/styles/colors';

import ConsoleLogo from '@/services/auth/components/ConsoleLogo.vue';
import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';


const router = useRouter();

const handleClickSignin = () => {
    const token = SpaceConnector.getAccessToken();
    if (!token) {
        router.push({ name: AUTH_ROUTE.SIGN_IN._NAME });
    } else {
        router.push({ name: ROOT_ROUTE._NAME });
        const isTokenAlive = SpaceConnector.isTokenAlive;
        if (isTokenAlive) router.push({ name: ROOT_ROUTE._NAME });
        else router.push({ name: AUTH_ROUTE.SIGN_OUT._NAME });
    }
};
</script>

<template>
    <section class="page-wrapper">
        <console-logo :size-ratio="0.8" />
        <article class="expired-contents">
            <p-i name="ic_face-frown"
                 width="5rem"
                 height="5rem"
                 :color="gray[200]"
            />
            <div class="expired-description-wrapper">
                <p class="title">
                    The link has expired
                </p>
                <p class="description">
                    The link was set to expire after a certain amount of time. Please contact the person who shared this link with you or your administrator.
                </p>
            </div>
            <p-button style-type="primary"
                      size="md"
                      @click="handleClickSignin"
            >
                {{ $t('Go to Sign In') }}
            </p-button>
        </article>
    </section>
</template>

<style lang="postcss" scoped>
.page-wrapper {
    @apply bg-gray-100;
    display: flex;
    height: 100%;

    .expired-contents {
        @apply flex flex-col justify-center items-center;
        width: 25rem;
        text-align: center;
        margin: auto;

        .expired-description-wrapper {
            margin: 1.5rem 0;
            .title {
                @apply text-display-md;
                margin-bottom: 0.6875rem;
            }
            .description {
                @apply text-paragraph-md;
            }
        }
    }
}

</style>
