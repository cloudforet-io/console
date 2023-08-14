<script lang="ts">
import { isEmpty } from 'lodash';
import {
    toRefs, reactive, computed, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

import { SpaceRouter } from '@/router';

import { isUserAccessibleToRoute } from '@/lib/access-control';
import config from '@/lib/config';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { getDefaultRouteAfterSignIn } from '@/services/auth/lib/helper';
import IDPWSignIn from '@/services/auth/sign-in/local/template/ID_PW.vue';
import SignInLeftContainer from '@/services/auth/sign-in/modules/SignInLeftContainer.vue';
import SignInRightContainer from '@/services/auth/sign-in/modules/SignInRightContainer.vue';



export default {
    name: 'SignInPage',
    components: {
        SignInRightContainer,
        SignInLeftContainer,
        IDPWSignIn,
    },
    beforeRouteEnter(to, from, next) {
        if (from?.meta.isSignInPage) {
            next((vm) => {
                vm.$router.replace({
                    query: { ...to.query, nextPath: from.query.nextPath },
                }).catch(() => {});
            });
        } else next();
    },
    props: {
        admin: {
            type: Boolean,
            default: false,
        },
        nextPath: {
            type: String,
            default: undefined,
        },
        error: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const router = useRouter();
        const route = useRoute();
        const store = useStore();

        const state = reactive({
            userType: computed(() => (props.admin ? 'DOMAIN_OWNER' : 'USER')),
            authType: computed(() => store.state.domain.extendedAuthType),
            beforeUser: store.state.user.userId,
            component: computed(() => {
                let component;
                const auth = state.authType;
                if (auth) {
                    try {
                        component = () => import(`./external/${auth}/template/${auth}.vue`);
                    } catch (e) {
                        ErrorHandler.handleError(e);
                    }
                }
                return component;
            }),
            images: computed(() => {
                const domainImage = config.get('DOMAIN_IMAGE');
                if (!isEmpty(domainImage)) {
                    return {
                        ciLogo: config.get('DOMAIN_IMAGE.CI_LOGO'),
                        ciTextWithType: config.get('DOMAIN_IMAGE.CI_TEXT_WITH_TYPE'),
                        signIn: config.get('DOMAIN_IMAGE.SIGN_IN'),
                    };
                }
                return undefined;
            }),
            showErrorMessage: route.query.error === 'error' || computed(() => store.state.display.isSignInFailed),
        });
        const onSignIn = async (userId:string) => {
            try {
                const isSameUserAsPreviouslyLoggedInUser = state.beforeUser === userId;
                const defaultRoute = getDefaultRouteAfterSignIn(store.getters['user/isDomainOwner'], store.getters['user/hasSystemRole'], store.getters['user/hasPermission']);

                if (!props.nextPath || !isSameUserAsPreviouslyLoggedInUser) {
                    await router.push(defaultRoute);
                    return;
                }

                const resolvedRoute = SpaceRouter.router.resolve(props.nextPath);
                const isAccessible = isUserAccessibleToRoute(resolvedRoute, store.getters['user/pagePermissionList']);
                if (isAccessible) {
                    await router.push(resolvedRoute);
                } else {
                    await router.push(defaultRoute);
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        /* Watcher */
        watch(() => route.query.error, (value) => {
            state.showErrorMessage = !!value;
        });

        watch(() => route.name, () => {
            store.dispatch('display/hideSignInErrorMessage');
        }, { immediate: true });

        return {
            ...toRefs(state),
            onSignIn,
        };
    },
};
</script>

<template>
    <div class="wrapper">
        <div class="ci-wrapper">
            <template v-if="images">
                <img class="logo-character"
                     :src="images.ciLogo"
                     alt="logo-character-image"
                >
                <img class="logo-text"
                     :src="images.ciTextWithType"
                     alt="logo-text-image"
                >
            </template>
            <template v-else>
                <img class="logo-character"
                     src="@/assets/images/brand/brand_logo.png"
                     alt="logo-character-image"
                >
                <img class="logo-text"
                     src="@/assets/images/brand/spaceone-logotype-with-Service-Type.svg"
                     alt="logo-text-image"
                >
            </template>
        </div>
        <sign-in-left-container
            :is-admin="false"
            :images="images"
        />
        <sign-in-right-container
            :is-admin="false"
            :images="images"
            :show-error-message="showErrorMessage"
        >
            <template #input>
                <i-d-p-w-sign-in class="id-pw-wrapper"
                                 @sign-in="onSignIn"
                />
                <div v-if="component"
                     class="btn-divider"
                >
                    <span>{{ $t('COMMON.SIGN_IN.OR') }}</span>
                </div>
                <component :is="component"
                           class="sign-in-template"
                           @sign-in="onSignIn"
                />
            </template>
        </sign-in-right-container>
    </div>
</template>

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
    @apply flex;
    position: fixed;
    flex-flow: row;
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

    @screen tablet {
        @apply hidden;
    }
}

.right-container {
    @media screen and (width < 478px) {
        .template-wrapper {
            width: 15rem;
            margin: auto 2.5rem;
            align-self: center;
            .right-logo-character {
                @apply mx-auto;
                display: block;
                width: 33%;
                margin-bottom: calc((15rem / 3) / 2 - 0.5rem);
            }
            .sign-in-title {
                display: none;
            }
            .sign-in-subtitle {
                display: none;
            }
        }
    }
}

.id-pw-wrapper {
    margin-bottom: 1.5rem;
}

.btn-divider {
    @apply text-gray-200;
    display: flex;
    flex-basis: 100%;
    align-items: center;
    font-size: 0.75rem;
    line-height: 120%;
    margin-bottom: 1.5rem;
}
.btn-divider > span {
    @apply text-gray-900;
    margin: 0.5rem;
}
.btn-divider::before,
.btn-divider::after {
    @apply bg-gray-200;
    content: "";
    flex-grow: 1;
    height: 1px;
}
</style>
