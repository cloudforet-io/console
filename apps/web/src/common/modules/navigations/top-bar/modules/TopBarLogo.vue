<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { Location } from 'vue-router';

import { store } from '@/store';

const props = withDefaults(defineProps<{
    to?: Location|null;
}>(), {
    to: null,
});

const state = reactive({
    symbolImage: computed<string|undefined>(() => store.getters['domain/domainSymbolImage']),
    wordTypeLogoImage: computed<string|undefined>(() => store.getters['domain/domainWordTypeLogoImage']),
});
</script>

<template>
    <span class="top-bar-logo"
          data-gtm="gtm-gnb-logo"
    >
        <component :is="props.to ? 'router-link' : 'div'"
                   class="inline-block"
                   :to="props.to"
        >
            <div class="logo-wrapper">
                <img v-if="state.symbolImage"
                     class="logo-character"
                     :src="state.symbolImage"
                >
                <img v-else
                     class="logo-character"
                     src="@/assets/images/brand/brand_logo.png"
                >

                <img v-if="state.wordTypeLogoImage"
                     class="logo-text"
                     :src="state.wordTypeLogoImage"
                >
                <img v-else
                     class="logo-text"
                     src="@/assets/images/brand/SpaceONE_logoTypeA.svg"
                >
            </div>
        </component>
    </span>
</template>

<style lang="postcss" scoped>
.top-bar-logo {
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
