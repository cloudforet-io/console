<script setup lang="ts">
import { useWindowSize } from '@vueuse/core/index';
import { computed, reactive } from 'vue';

import { PI, screens } from '@spaceone/design-system';

import { store } from '@/store';

import DomainLandingRecommendation from '@/services/landing/components/DomainLandingRecommendation.vue';
import DomainLandingStartBanner from '@/services/landing/components/DomainLandingStartBanner.vue';
import DomainLandingTitle from '@/services/landing/components/DomainLandingTitle.vue';

const { width } = useWindowSize();

const storeState = reactive({
    isDomainAdmin: computed<boolean>(() => store.getters['user/isDomainAdmin']),
});
const state = reactive({
    isTabletSize: computed(() => width.value < screens.tablet.max),
});
</script>

<template>
    <div class="domain-landing-page">
        <div class="contents-container">
            <div class="contents-wrapper">
                <domain-landing-title />
                <domain-landing-start-banner v-if="storeState.isDomainAdmin" />
                <div v-else
                     class="notification"
                >
                    <p-i name="ic_warning-filled"
                         class="item-type-icon"
                         width="1.25rem"
                         height="1.25rem"
                    />
                    <p class="text">
                        <strong class="title">{{ $t('LADING.NOT_FOUND_DESC') }}</strong>
                        <span class="desc">{{ $t('LADING.DOMAIN.ALT_W_DESC') }}</span>
                    </p>
                </div>
            </div>
            <div v-if="!storeState.isDomainAdmin && !state.isTabletSize"
                 class="image-wrapper"
            >
                <img alt="workspace-mode-illustration"
                     src="/images/domain-landing/domain-landing_hero-image.png"
                     srcset="/images/domain-landing/domain-landing_hero-image@2x.png 2x,
                        /images/domain-landing/domain-landing_hero-image@3x.png 3x"
                     class="workspace-mode-illustration"
                >
            </div>
        </div>
        <domain-landing-recommendation />
    </div>
</template>

<style lang="postcss" scoped>
.domain-landing-page {
    @apply flex flex-col;
    width: 100%;
    max-width: 87rem;
    padding-top: 5rem;
    gap: 4rem;
    .contents-container {
        @apply flex;
        .contents-wrapper {
            @apply flex flex-col;
            flex: 1;
            gap: 4rem;
        }
        .image-wrapper {
            @apply relative;
            width: 32.5rem;
            .workspace-mode-illustration {
                @apply absolute;
                top: -2.625rem;
                right: 3.875rem;
                min-width: 24.625rem;
                width: 24.625rem;
                height: 25rem;
            }
        }
    }
    .notification {
        @apply flex items-start bg-yellow-100;
        max-width: 54.625rem;
        margin-bottom: 1rem;
        padding: 0.5rem 1rem;
        gap: 0.25rem;
        border-radius: 0.25rem;
        .text {
            @apply text-paragraph-md;
            .title {
                @apply text-label-lg text-yellow-700;
            }
            .desc {
                @apply block;
            }
        }
    }
}
</style>
