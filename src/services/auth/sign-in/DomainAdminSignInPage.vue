<template>
    <div class="wrapper">
        <div class="ci-wrapper">
            <img v-if="ciLogoImage" class="logo-character" :src="ciLogoImage">
            <img v-else class="logo-character" src="@/assets/images/brand/brand_logo.png">

            <img v-if="ciTextWithTypeImage" class="logo-text" :src="ciTextWithTypeImage">
            <img v-else class="logo-text" src="@/assets/images/brand/spaceone-logotype-with-Service-Type.svg">
        </div>
        <sign-in-left-container
            :is-admin="true"
        />
        <sign-in-right-container
            :is-admin="true"
            :show-error-message="showErrorMessage"
        >
            <template #input>
                <i-d-p-w-sign-in class="local-sign-in-wrapper"
                                 :is-admin="true"
                                 @sign-in="onSignIn"
                />
            </template>
        </sign-in-right-container>
    </div>
</template>

<script lang="ts">
import {
    toRefs, reactive, computed, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import IDPWSignIn from '@/services/auth/sign-in/local/template/ID_PW.vue';
import SignInLeftContainer from '@/services/auth/sign-in/modules/SignInLeftContainer.vue';
import SignInRightContainer from '@/services/auth/sign-in/modules/SignInRightContainer.vue';

import { TranslateResult } from 'vue-i18n';
import { store } from '@/store';
import { AUTH_ROUTE } from '@/services/auth/route-config';
import config from '@/lib/config';
import ErrorHandler from '@/common/composables/error/errorHandler';


export default {
    name: 'DomainAdminSignInPage',
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
                await vm.$router.push(props.nextPath);
            } catch (e) {
                ErrorHandler.handleError(e);
                await store.dispatch('display/showSignInErrorMessage');
            }
        };

        const hideErrorMessage = () => {
            store.dispatch('display/hideSignInErrorMessage');
        };
        const goToUserSignIn = () => {
            if (props.admin) vm.$router.replace({ name: AUTH_ROUTE.SIGN_IN._NAME });
        };
        return {
            ...toRefs(state),
            ...toRefs(validationState),
            onSignIn,
            goToUserSignIn,
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
        width: auto;
        height: 40px;
        margin-top: 2.5rem;
    }
}
</style>
