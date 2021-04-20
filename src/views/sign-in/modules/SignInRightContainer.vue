<template>
    <div class="sign-in-right-container" :class="{ admin: isAdmin }">
        <div class="form-wrapper">
            <div class="hidden xs:block">
                <p class="title">
                    {{ $t('COMMON.SIGN_IN.SIGN_IN') }}
                </p>
                <p class="subtitle">
                    {{ isAdmin ? $t('COMMON.SIGN_IN.SIGN_IN_FOR_ROOT_ACCOUNT') : $t('COMMON.SIGN_IN.FOR_MEMBER_ACCOUNT') }}
                </p>
            </div>

            <div class="flex xs:hidden">
                <img v-if="images" class="logo-character" :src="images.ciLogo">
                <img v-else class="logo-character" src="@/assets/images/brand/brand_logo.png">
            </div>

            <div v-if="showErrorMessage" class="error-msg-box">
                <span class="error-msg">{{ $t('COMMON.SIGN_IN.ALT_E_SIGN_IN') }}</span>
                <p-i name="ic_delete" width="1.5rem" height="1.5rem"
                     class="cursor-pointer"
                     color="inherit"
                     @click="hideErrorMessage"
                />
            </div>

            <slot name="input" />

            <template v-if="isAdmin">
                <span class="sign-in-button-wrapper" @click="goToUserSignIn">
                    <p-i name="ic_arrow_left_sm" width="0.5rem" height="0.5rem"
                         color="inherit"
                         class="user-icon"
                    />
                    {{ $t('COMMON.SIGN_IN.MEMBER_SIGN_IN') }}
                </span>
            </template>
            <template v-else>
                <span class="sign-in-button-wrapper" @click="goToAdminSignIn">
                    <p-i name="root-account" width="1.5rem" height="1.5rem"
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
    PI,
} from '@spaceone/design-system';
import { ComponentRenderProxy, getCurrentInstance } from '@vue/composition-api';

export default {
    name: 'SignInRightContainer',
    components: {
        PI,
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
        showErrorMessage: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        /* event */
        const hideErrorMessage = () => {
            emit('update:show-error-message', false);
        };
        const goToAdminSignIn = () => {
            vm.$router.replace({ name: 'AdminSignIn' });
        };
        const goToUserSignIn = () => {
            vm.$router.replace({ name: 'SignIn' });
        };

        return {
            hideErrorMessage,
            goToAdminSignIn,
            goToUserSignIn,
        };
    },
};
</script>

<style lang="postcss" scoped>
.sign-in-right-container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow-y: auto;
    padding: 2rem;

    &.admin {
        @apply bg-primary4;

        .form-wrapper {
            .title {
                @apply text-primary-dark;
            }
        }
    }

    .form-wrapper {
        width: 15rem;
        margin: auto 2.5rem;
        align-self: center;

        @screen xs {
            width: 25rem;
            margin: auto;
        }

        .logo-character {
            width: 33%;
            margin-bottom: calc((15rem / 3) / 2 - 0.5rem);
            margin-left: auto;
            margin-right: auto;
        }
        .title {
            @apply text-primary1;
            font-size: 2rem;
            line-height: 150%;
        }
        .subtitle {
            @apply text-gray-400;
            font-size: 0.875rem;
            line-height: 140%;
            margin-bottom: 3rem;
        }
        .error-msg-box {
            @apply bg-red-100 text-red-500;
            display: flex;
            justify-content: space-between;
            width: 100%;
            height: 2.25rem;
            border-radius: 0.125rem;
            padding: 0.5rem;
            margin-top: -2.75rem;

            .error-msg {
                font-size: 0.875rem;
                line-height: 140%;
            }

            @media screen and (width < 478px) {
                position: absolute;
                width: 15rem;
                height: 3.5rem;
                z-index: 1;
                margin-top: -4rem;
            }
        }
        .sign-in-button-wrapper {
            @apply text-blue-600;
            display: block;
            font-size: 0.875rem;
            line-height: 1.4;
            cursor: pointer;
            margin-top: 5.5rem;

            &:hover {
                text-decoration: underline;
            }

            .admin-icon {
                margin-right: 0.5rem;
                border-radius: 0.75rem;
            }
            .user-icon {
                margin-right: 0.5rem;
            }
        }
    }
}
</style>
