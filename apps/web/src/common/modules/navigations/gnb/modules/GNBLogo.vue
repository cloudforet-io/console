<template>
    <span class="gnb-logo"
          data-gtm="gtm-gnb-logo"
    >
        <component :is="to ? 'router-link' : 'div'"
                   class="inline-block"
                   :to="to"
        >
            <div class="logo-wrapper">
                <img v-if="symbolImage"
                     class="logo-character"
                     :src="symbolImage"
                >
                <img v-else
                     class="logo-character"
                     src="@/assets/images/brand/brand_logo.png"
                >

                <img v-if="wordTypeLogoImage"
                     class="logo-text"
                     :src="wordTypeLogoImage"
                >
                <img v-else
                     class="logo-text"
                     src="@/assets/images/brand/SpaceONE_logoTypeA.svg"
                >
            </div>
        </component>
    </span>
</template>

<script lang="ts">
import {
    computed, defineComponent,
    reactive, toRefs,
} from 'vue';

import { store } from '@/store';

export default defineComponent({
    name: 'GNBLogo',
    props: {
        to: {
            type: Object,
            default: null,
        },
    },
    setup() {
        const state = reactive({
            symbolImage: computed<string|undefined>(() => store.getters['domain/domainSymbolImage']),
            wordTypeLogoImage: computed<string|undefined>(() => store.getters['domain/domainWordTypeLogoImage']),
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>

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
