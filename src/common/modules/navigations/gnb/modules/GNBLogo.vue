<template>
    <span class="gnb-logo">
        <component :is="to ? 'router-link' : 'div'"
                   class="inline-block" :to="to"
        >
            <div class="logo-wrapper mr-4 lg:mr-10">
                <template v-if="images">
                    <img class="logo-character" :src="images.ciLogo">
                    <img class="logo-text" :src="images.ciText">
                </template>
                <template v-else>
                    <img class="logo-character" src="@/assets/images/brand/brand_logo.png">
                    <img class="logo-text" src="@/assets/images/brand/SpaceONE_logoTypeA.svg">
                </template>
            </div>
        </component>
    </span>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs,
} from '@vue/composition-api';
import config from '@/lib/config';
import { isEmpty } from 'lodash';

export default {
    name: 'GNBLogo',
    props: {
        to: {
            type: Object,
            default: null,
        },
    },
    setup() {
        const state = reactive({
            images: computed(() => {
                const domainImage = config.get('DOMAIN_IMAGE');
                if (!isEmpty(domainImage)) {
                    return {
                        ciLogo: config.get('DOMAIN_IMAGE.CI_LOGO'),
                        ciText: config.get('DOMAIN_IMAGE.CI_TEXT'),
                        signIn: config.get('DOMAIN_IMAGE.SIGN_IN'),
                    };
                }
                return undefined;
            }),
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.gnb-logo {
    .logo-wrapper {
        display: inline-block;
        .logo-character {
            display: inline-block;
            width: 1.875rem;
            height: 1.875rem;
        }
        .logo-text {
            display: none;
            height: 0.875rem;
            margin-left: 0.5rem;

            @screen lg {
                display: inline-block;
            }
        }
    }
}
</style>
