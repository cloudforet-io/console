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
            :is-admin="true"
            :images="images"
        />
        <sign-in-right-container
            :is-admin="true"
            :images="images"
            :show-error-message.sync="showErrorMessage"
        >
            <template #input>
                <i-d-p-w-sign-in class="local-sign-in-wrapper"
                                 :is-admin="true"
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
import SignInRightContainer from '@/views/sign-in/modules/SignInRightContainer.vue';

import { TranslateResult } from 'vue-i18n';
import { store } from '@/store';
import config from '@/lib/config';


export default {
    name: 'DomainAdminSignIn',
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
            state.showErrorMessage = false;
            try {
                await vm.$router.push(props.nextPath);
            } catch (e) {
                console.error(e);
                state.showErrorMessage = true;
            }
        };

        const onSignInError = () => {
            state.showErrorMessage = true;
        };

        const hideErrorMessage = () => {
            state.showErrorMessage = false;
        };
        const goToUserSignIn = () => {
            if (props.admin) vm.$router.replace({ name: 'SignIn' });
        };
        return {
            ...toRefs(state),
            ...toRefs(validationState),
            onSignIn,
            goToUserSignIn,
            onSignInError,
            hideErrorMessage,
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

    @screen xs {
        display: flex;
    }

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
}
</style>
