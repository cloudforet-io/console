<script setup lang="ts">

import { computed, reactive } from 'vue';
import type { Location } from 'vue-router/types/router';

import config from '@/lib/config';

interface Props {
    to: Location;
}

const props = defineProps<Props>();

const state = reactive({
    ciLogoImage: computed(() => config.get('DOMAIN_IMAGE.CI_LOGO')),

});


</script>

<template>
    <div class="my-page-gnb-header">
        <component :is="props.to ? 'router-link' : 'div'"
                   class="title-wrapper"
                   :to="props.to"
        >
            <div class="logo-wrapper">
                <img v-if="state.ciLogoImage"
                     class="logo-character"
                     :src="state.ciLogoImage"
                >
                <img v-else
                     class="logo-character"
                     src="/images/logos/spaceone-default-logo.svg"
                >
            </div>
        </component>
    </div>
</template>

<style scoped lang="postcss">
.my-page-gnb-header {
    @apply inline-flex items-center w-full;
    max-width: 16.25rem;
    width: 16.25rem;
    padding: 0.625rem 1rem 0.625rem 1.25rem;
    box-shadow: 0.1875rem 0 0.1875rem 0 rgba(81, 83, 100, 0.15);

    @screen tablet {
        width: 3.25rem;
        box-shadow: none;
    }

    .title-wrapper {
        @apply inline-block;

        .logo-wrapper {
            width: 2rem;
            height: 2rem;
            .logo-character {
                display: inline-block;
                width: 2rem;
                height: 2rem;
            }
        }
    }
}
</style>
