<template>
    <div class="wrapper">
        <div class="ci-wrapper">
            <template v-if="images">
                <img class="logo-character" :src="images.ciLogo">
                <img class="logo-text" :src="images.ciTextWithType">
            </template>
            <template v-else>
                <img class="logo-character" src="@/assets/images/brand/brand_logo.png">
                <img class="logo-text" src="@/assets/images/brand/spaceone-logotype-with-Service-Type.svg">
            </template>
        </div>
        <sign-in-left-container
            :is-admin="false"
            :images="images"
        />
        <sign-in-right-container
            :is-admin="false"
            :images="images"
            :show-error-message.sync="showErrorMessage"
        >
            <template #input>
                <i-d-p-w-sign-in class="id-pw-wrapper"
                                 @sign-in="onSignIn"
                                 @sign-in-error="onSignInError"
                />
                <div v-if="component" class="btn-divider">
                    <span>{{ $t('COMMON.SIGN_IN.OR') }}</span>
                </div>
                <component :is="component" class="sign-in-template"
                           @sign-in="onSignIn"
                           @sign-in-error="onSignInError"
                />
            </template>
        </sign-in-right-container>
    </div>
</template>

<script lang="ts">
import { isEmpty } from 'lodash';

import {
    toRefs, reactive, computed, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import IDPWSignIn from '@/views/sign-in/templates/ID_PW.vue';
import SignInLeftContainer from '@/views/sign-in/modules/SignInLeftContainer.vue';
import { store } from '@/store';
import config from '@/lib/config';
import SignInRightContainer from '@/views/sign-in/modules/SignInRightContainer.vue';
import { IDENTITY_ROUTE } from '@/routes/identity/identity-route';


export default {
    name: 'SignIn',
    components: {
        SignInRightContainer,
        SignInLeftContainer,
        IDPWSignIn,
    },
    props: {
        admin: {
            type: Boolean,
            default: false,
        },
        nextPath: {
            type: String,
            default: '/',
        },
        error: {
            type: String,
            default: '',
        },
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
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            userType: computed(() => (props.admin ? 'DOMAIN_OWNER' : 'USER')),
            authType: computed(() => store.state.domain.extendedAuthType),
            component: computed(() => {
                let component;
                const auth = state.authType;
                if (auth) {
                    try {
                        component = () => import(`../templates/${auth}.vue`);
                    } catch (e) {
                        console.error(e);
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
            showErrorMessage: false,
        });
        const onSignIn = async () => {
            state.showErrorMessage = false;
            try {
                const hasPermission = vm.$store.getters['user/hasPermission'];
                if (!hasPermission && vm.$route.name !== IDENTITY_ROUTE.USER.ACCOUNT._NAME) {
                    await vm.$router.replace({ name: IDENTITY_ROUTE.USER.ACCOUNT._NAME });
                } else await vm.$router.push(props.nextPath);
            } catch (e) {
                console.error(e);
                state.showErrorMessage = true;
            }
        };

        const onSignInError = () => {
            state.showErrorMessage = true;
        };

        (async () => {
            if (vm.$route.query.error === 'error') {
                await onSignInError();
                await vm.$router.replace({ query: { ...vm.$route.query, error: null } });
            }
        })();
        return {
            ...toRefs(state),
            onSignIn,
            onSignInError,
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
    display: none;
    flex-flow: row;
    .logo-character {
        width: 56px;
        height: 56px;
        margin-top: 2rem;
        margin-left: 2rem;
    }
    .logo-text {
        width: 146px;
        height: 40px;
        margin-top: 2.5rem;
    }

    @screen xs {
        display: flex;
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
