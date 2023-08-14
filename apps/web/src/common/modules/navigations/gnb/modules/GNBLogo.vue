<script lang="ts" setup>
import {
    computed,
    reactive,
} from 'vue';
import type { RouteLocation } from 'vue-router';

import config from '@/lib/config';

interface Props {
    to: RouteLocation;
}

defineProps<Props>();

const state = reactive({
    ciLogoImage: computed(() => config.get('DOMAIN_IMAGE.CI_LOGO')),
    ciTextImage: computed(() => config.get('DOMAIN_IMAGE.CI_TEXT')),
});

</script>

<template>
    <span class="gnb-logo"
          data-gtm="gtm-gnb-logo"
    >
        <component :is="to ? 'router-link' : 'div'"
                   class="inline-block"
                   :to="to"
        >
            <div class="logo-wrapper">
                <img v-if="state.ciLogoImage"
                     class="logo-character"
                     :src="state.ciLogoImage"
                     alt="logo-image"
                >
                <img v-else
                     class="logo-character"
                     src="@/assets/images/brand/brand_logo.png"
                     alt="brand-logo-image"
                >

                <img v-if="state.ciTextImage"
                     class="logo-text"
                     :src="state.ciTextImage"
                     alt="logo-text"
                >
                <img v-else
                     class="logo-text"
                     src="@/assets/images/brand/SpaceONE_logoTypeA_v1.9.svg"
                >
            </div>
        </component>
    </span>
</template>

<style lang="postcss" scoped>
.gnb-logo {
    .logo-wrapper {
        display: inline-block;
        .logo-character {
            display: inline-block;
            width: 1.75rem;
            height: 1.75rem;
        }
        .logo-text {
            display: inline-block;
            height: 1rem;
            margin-left: 0.25rem;

            @screen mobile {
                display: none;
            }
        }
    }
}
</style>
