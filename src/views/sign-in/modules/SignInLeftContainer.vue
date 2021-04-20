<template>
    <div class="sign-in-left-container" :class="{ admin: isAdmin }">
        <div class="lottie-wrapper">
            <img v-if="images" :src="images.signIn">
            <p-lottie v-else
                      :name="isAdmin ? 'lottie_planet_signin' : 'lottie_floating-astronaut_signin'"
                      auto
                      width="100%"
                      height="80%"
            />
        </div>
        <div class="version">
            <p-badge style-type="primary" outline shape="square">
                {{ $t('COMMON.SIGN_IN.VERSION') }} {{ version }}
            </p-badge>
            <span class="help-msg">{{ $t('COMMON.SIGN_IN.NEED_HELP') }}
                <p-anchor href="mailto:support@spaceone.dev" target="_blank"
                          :show-icon="false" highlight
                >
                    <span class="text-blue-600 ml-2">{{ $t('COMMON.SIGN_IN.CONTACT') }}</span>
                </p-anchor>
            </span>
        </div>
    </div>
</template>

<script lang="ts">
import { reactive, toRefs } from '@vue/composition-api';

import {
    PLottie, PAnchor, PBadge,
} from '@spaceone/design-system';

export default {
    name: 'SignInLeftContainer',
    components: {
        PLottie,
        PAnchor,
        PBadge,
    },
    props: {
        isAdmin: {
            type: Boolean,
            default: false,
        },
        images: {
            type: Object,
            default: undefined,
        },
    },
    setup() {
        const state = reactive({
            version: process.env.VUE_APP_VERSION,
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.sign-in-left-container {
    @apply bg-primary4;
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 33%;
    height: 100%;

    &.admin {
        @apply bg-primary3;
    }

    .lottie-wrapper {
        @apply flex justify-center items-center;
        width: 80%;
        max-width: 42.625rem;
        margin: auto;
    }

    .version {
        margin-left: 2.5rem;
        margin-bottom: 2.5rem;
        .help-msg {
            @apply text-gray-500;
            font-size: 0.875rem;
            line-height: 140%;
            margin-left: 1rem;
        }
    }

    @screen md {
        display: flex;
    }
}
</style>
