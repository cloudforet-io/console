<template>
    <div>
        <div class="user-info">
            <div class="g-signin2">
                <div id="g-signin-btn" class="w-full" />
            </div>
            <div class="btn-divider">
                <span>{{ $t('COMMON.SIGN_IN.OR') }}</span>
            </div>
            <div class="flex flex-col mb-4 md:w-full">
                <p-button :outline="true"
                          type="submit"
                          size="lg"
                          class="admin-btn"
                          @click="goToAdmin"
                >
                    <span id="button-msg">{{ $t('COMMON.SIGN_IN.ROOT_ACCOUNT') }}</span>
                </p-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    defineComponent, getCurrentInstance, onMounted,
} from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/PButton.vue';
import { showErrorMessage } from '@/lib/util';

// @ts-ignore
const { gapi } = window;

export default defineComponent({
    name: 'GoogleSignIn',
    components: {
        PButton,
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const onSignIn = async (googleUser) => {
            const credentials = {
                // eslint-disable-next-line camelcase
                access_token: googleUser.getAuthResponse().access_token,
            };
            const auth2 = await gapi.auth2.getAuthInstance();
            if (!auth2.isSignedIn.get()) {
                return;
            }
            context.emit('onSignIn', credentials);
        };
        const goToAdmin = () => {
            vm.$router.push({ name: 'AdminLogin' });
        };
        const signInFail = () => {
            console.error('sign in failed');
        };
        onMounted(async () => {
            gapi.load('auth', () => {
                gapi.auth2.init({
                    // eslint-disable-next-line camelcase
                    client_id: vm.$store.state.domain.authOptions.client_id,
                    // client_id: store.domain.state.pluginOption.client_id,
                    // eslint-disable-next-line camelcase
                    fetch_basic_profile: false,
                    scope: 'profile',
                });
                gapi.signin2.render('g-signin-btn', {
                    scope: 'email',
                    height: 48,
                    width: 'auto',
                    longtitle: true,
                    theme: 'dark',
                    onsuccess: onSignIn,
                    onfailure: signInFail,
                });
            });
        });
        return {
            goToAdmin,
            onSignIn,
        };
    },
});
</script>

<style lang="postcss" scoped>
.subtitle {
    padding-top: 0.5rem;
    font-size: 0.875rem;
}

#errorMsg {
    color: red;
}

#g-signin-btn {
    padding-top: 1.5rem;
    padding-bottom: 3.5rem;
}

.btn-divider {
    @apply text-gray-200;
    display: flex;
    flex-basis: 100%;
    align-items: center;
    font-style: normal;
    font-weight: bold;
    font-size: 0.875rem;
    margin-bottom: 1em;
}
.btn-divider > span {
    @apply text-gray-300;
    margin: 0.5rem;
}
.btn-divider::before,
.btn-divider::after {
    @apply bg-gray-200;
    content: "";
    flex-grow: 1;
    height: 1px;
    font-size: 0;
    line-height: 0px;
    margin: 0 8px;
}
.admin-btn {
    @apply border border-gray-300;
    &:hover {
        @apply bg-blue-100 text-blue-500 border-blue-500;
    }
    &:active {
        @apply bg-blue-200 text-blue-500 border-blue-500;
    }
}
.user-info {
    @screen md {
        min-width: 18rem;
    }
}
#button-msg {
    @apply font-normal;
    font-size: 0.875rem;
}
</style>
