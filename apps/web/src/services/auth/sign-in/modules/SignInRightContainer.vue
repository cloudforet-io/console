<template>
    <div class="sign-in-right-container"
         :class="{ admin: isDomainOwner }"
    >
        <div class="form-wrapper">
            <div class="headline-wrapper">
                <div class="block mobile:hidden">
                    <p class="title">
                        {{ $t('COMMON.SIGN_IN.SIGN_IN') }}
                    </p>
                    <p class="subtitle">
                        {{ isDomainOwner ? $t('COMMON.SIGN_IN.SIGN_IN_FOR_ROOT_ACCOUNT') : $t('COMMON.SIGN_IN.FOR_MEMBER_ACCOUNT') }}
                    </p>
                </div>

                <div class="hidden mobile:flex">
                    <img v-if="ciLogoImage"
                         class="logo-character"
                         :src="ciLogoImage"
                    >
                    <img v-else
                         class="logo-character"
                         src="@/assets/images/brand/brand_logo.png"
                    >
                </div>

                <div v-if="showErrorMessage"
                     class="error-msg-box"
                >
                    <span class="error-msg">{{ $t('COMMON.SIGN_IN.ALT_E_SIGN_IN') }}</span>
                    <p-i name="ic_close"
                         width="1.5rem"
                         height="1.5rem"
                         class="cursor-pointer"
                         color="inherit"
                         @click="hideErrorMessage"
                    />
                </div>
            </div>

            <slot name="input" />

            <template v-if="isDomainOwner">
                <span class="sign-in-button-wrapper"
                      @click="goToUserSignIn"
                >
                    <p-i name="ic_chevron-small-left"
                         width="0.5rem"
                         height="0.5rem"
                         color="inherit"
                         class="user-icon"
                    />
                    {{ $t('COMMON.SIGN_IN.MEMBER_SIGN_IN') }}
                </span>
            </template>
            <template v-else>
                <span class="sign-in-button-wrapper"
                      @click="goToAdminSignIn"
                >
                    <p-i name="img_avatar_root-account"
                         width="1.5rem"
                         height="1.5rem"
                         class="admin-icon"
                    />
                    <span class="admin-sign-in-text">{{ $t('COMMON.SIGN_IN.SIGN_IN_FOR_ROOT_ACCOUNT') }}</span>
                </span>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, reactive, toRefs,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import {
    PI,
} from '@spaceone/design-system';

import { store } from '@/store';

import config from '@/lib/config';

import { AUTH_ROUTE } from '@/services/auth/route-config';

export default {
    name: 'SignInRightContainer',
    components: {
        PI,
    },
    props: {
        isDomainOwner: {
            type: Boolean,
            default: false,
        },
        showErrorMessage: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const vm = getCurrentInstance()?.proxy as Vue;
        const state = reactive({
            ciLogoImage: computed(() => config.get('DOMAIN_IMAGE.CI_LOGO')),
        });

        /* event */
        const hideErrorMessage = () => {
            if (vm.$route.query.error) vm.$router.replace({ query: { error: null } });
            store.dispatch('display/hideSignInErrorMessage');
        };
        const goToAdminSignIn = () => {
            hideErrorMessage();
            vm.$router.replace({ name: AUTH_ROUTE.ADMIN_SIGN_IN._NAME });
        };
        const goToUserSignIn = () => {
            hideErrorMessage();
            vm.$router.replace({ name: AUTH_ROUTE.SIGN_IN._NAME });
        };

        return {
            ...toRefs(state),
            hideErrorMessage,
            goToAdminSignIn,
            goToUserSignIn,
        };
    },
};
</script>

<style lang="postcss" scoped>
.sign-in-right-container {
    @apply bg-white;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow-y: auto;
    padding: 2.5rem;

    &.admin {
        @apply bg-primary4;

        .form-wrapper {
            .title {
                @apply text-primary-dark;
            }
        }
    }

    .form-wrapper {
        position: relative;
        width: 100%;
        margin: auto 2.5rem;
        align-self: center;

        @screen xs {
            width: 25rem;
            margin: auto;
        }

        .headline-wrapper {
            @apply relative;
            margin-bottom: 0.5rem;
            .logo-character {
                max-width: 6rem;
                width: 25%;
                margin-bottom: calc((15rem / 3) / 2 - 0.5rem);
                margin-left: auto;
                margin-right: auto;
            }
            .title {
                @apply text-display-lg text-primary1;
            }
            .subtitle {
                @apply text-paragraph-md text-gray-400;
                padding-bottom: 1.75rem;
                margin-top: 0.5rem;
            }
            .error-msg-box {
                @apply absolute bg-red-100 text-red-500 rounded;
                display: flex;
                justify-content: space-between;
                right: 0;
                bottom: 0;
                left: 0;
                height: 2.25rem;
                padding: 0.5rem;

                .error-msg {
                    font-size: 0.875rem;
                    line-height: 140%;
                }

                @media screen and (width < 478px) {
                    position: absolute;
                    height: 3.5rem;
                    z-index: 1;
                    margin-top: -4rem;
                }
            }
        }
        .sign-in-button-wrapper {
            @apply text-blue-700;
            display: block;
            font-size: 0.875rem;
            line-height: 1.4;
            cursor: pointer;
            margin-top: 5.375rem;

            @screen mobile {
                text-align: center;
            }

            &:hover {
                text-decoration: underline;
            }

            .admin-icon {
                @apply rounded-2xl;
                margin-right: 0.5rem;
            }
            .user-icon {
                margin-right: 0.5rem;
            }
        }
    }
}
</style>
