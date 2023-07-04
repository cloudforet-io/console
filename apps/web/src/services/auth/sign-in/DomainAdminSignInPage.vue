<template>
    <div class="wrapper">
        <div class="ci-wrapper">
            <img v-if="ciLogoImage"
                 class="logo-character"
                 :src="ciLogoImage"
            >
            <img v-else
                 class="logo-character"
                 src="@/assets/images/brand/brand_logo.png"
            >

            <img v-if="ciTextWithTypeImage"
                 class="logo-text"
                 :src="ciTextWithTypeImage"
            >
            <img v-else
                 class="logo-text"
                 src="@/assets/images/brand/spaceone-logotype-with-Service-Type.svg"
            >
        </div>
        <sign-in-left-container
            is-domain-owner
        />
        <sign-in-right-container
            is-domain-owner
            :show-error-message="showErrorMessage"
        >
            <template #input>
                <i-d-p-w-sign-in class="local-sign-in-wrapper"
                                 is-domain-owner
                                 @sign-in="onSignIn"
                />
            </template>
        </sign-in-right-container>
    </div>
</template>

<script lang="ts">
import {
    toRefs, reactive, computed, getCurrentInstance,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Vue } from 'vue/types/vue';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import { isUserAccessibleToRoute } from '@/lib/access-control';
import config from '@/lib/config';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { getDefaultRouteAfterSignIn } from '@/services/auth/lib/helper';
import { AUTH_ROUTE } from '@/services/auth/route-config';
import IDPWSignIn from '@/services/auth/sign-in/local/template/ID_PW.vue';
import SignInLeftContainer from '@/services/auth/sign-in/modules/SignInLeftContainer.vue';
import SignInRightContainer from '@/services/auth/sign-in/modules/SignInRightContainer.vue';

export default {
    name: 'DomainAdminSignInPage',
    components: {
        SignInRightContainer,
        SignInLeftContainer,
        IDPWSignIn,
    },
    beforeRouteEnter(to, from, next) {
        if (from.meta.isSignInPage) {
            next((vm) => {
                vm.$router.replace({
                    query: { ...to.query, nextPath: from.query.nextPath },
                }).catch(() => {});
            });
        } else next();
    },
    props: {
        isDomainOwner: {
            type: Boolean,
            default: false,
        },
        nextPath: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const vm = getCurrentInstance()?.proxy as Vue;

        const state = reactive({
            userType: computed(() => (props.isDomainOwner ? 'DOMAIN_OWNER' : 'USER')),
            authType: computed(() => store.state.domain.extendedAuthType),
            ciLogoImage: computed(() => config.get('DOMAIN_IMAGE.CI_LOGO')),
            ciTextWithTypeImage: computed(() => config.get('DOMAIN_IMAGE.CI_TEXT_WITH_TYPE')),
            showErrorMessage: computed(() => store.state.display.isSignInFailed),
            userId: '' as string | undefined,
            password: '',
        });

        const validationState = reactive({
            isIdValid: undefined as undefined | boolean,
            idInvalidText: '' as TranslateResult | string,
            isPasswordValid: undefined as undefined | boolean,
            passwordInvalidText: '' as TranslateResult | string,
            isPasswordCheckValid: undefined as undefined | boolean,
            passwordCheckInvalidText: '' as TranslateResult | string,
        });
        const onSignIn = async () => {
            try {
                const defaultRoute = getDefaultRouteAfterSignIn(store.getters['user/isDomainOwner'], store.getters['user/hasSystemRole'], store.getters['user/hasPermission']);

                if (!props.nextPath) {
                    await vm.$router.push(defaultRoute);
                    return;
                }

                const resolvedRoute = SpaceRouter.router.resolve(props.nextPath);
                const isAccessible = isUserAccessibleToRoute(resolvedRoute.route, store.getters['user/pagePermissionList']);
                if (isAccessible) {
                    await vm.$router.push(props.nextPath);
                } else {
                    await vm.$router.push(defaultRoute);
                }
            } catch (e) {
                ErrorHandler.handleError(e);
                await store.dispatch('display/showSignInErrorMessage');
            }
        };

        const goToUserSignIn = () => {
            if (props.isDomainOwner) vm.$router.replace({ name: AUTH_ROUTE.SIGN_IN._NAME });
        };
        return {
            ...toRefs(state),
            ...toRefs(validationState),
            onSignIn,
            goToUserSignIn,
        };
    },
};

</script>

<style lang="postcss" scoped>
.wrapper {
    display: flex;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    bottom: 0;
}

.ci-wrapper {
    position: fixed;
    display: flex;
    flex-flow: row;

    @screen mobile {
        @apply hidden;
    }

    .logo-character {
        width: 56px;
        height: 56px;
        margin-top: 2rem;
        margin-left: 2rem;
    }
    .logo-text {
        width: auto;
        height: 40px;
        margin-top: 2.5rem;
    }
}
</style>
