<template>
    <div>
        <p class="subtitle">
            Multicloud Managed Service
        </p>
        <div class="user-info">
            <div class="g-signin2">
                <div id="g-signin-btn" class="w-full" />
            </div>
            <div class="btn-divider">
                <span>OR</span>
            </div>
            <div class="flex flex-col mb-4 md:w-full">
                <p-button :outline="true"
                          style-type="gray"
                          type="submit"
                          size="lg"
                          @click="goToAdmin"
                >
                    Sign in using root account credentials
                </p-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    defineComponent, getCurrentInstance, onMounted, reactive,
} from '@vue/composition-api';
import { CombinedVueInstance } from 'vue/types/vue';
import PButton from '@/components/atoms/buttons/Button.vue';

// @ts-ignore
const { gapi } = window;

export default defineComponent({
    name: 'Oauth',
    components: {
        PButton,
    },
    setup(props, context) {
        const vm = getCurrentInstance()as CombinedVueInstance<any, any, any, any, any>;
        const login = async (userId, param) => {
            // console.debug('start oauth login');
            const response = await vm.$http.post('/identity/token/issue', {
                credentials: param,
                domain_id: vm.$ls.domain.state.domainId,
            }, { skipAuthRefresh: true });
            context.emit('onLogin', userId, response.data);
        };
        const onLogIn = async (googleUser) => {
            const profile = googleUser.getBasicProfile();
            const userId = profile.getEmail();
            const param = {
                // eslint-disable-next-line camelcase
                access_token: googleUser.getAuthResponse().access_token,
            };
            const auth2 = await gapi.auth2.getAuthInstance();
            if (!auth2.isSignedIn.get()) {
                return;
            }
            auth2.disconnect();
            await login(userId, param);
        };
        const goToAdmin = () => {
            vm.$router.push({ name: 'AdminLogin' });
        };
        onMounted(async () => {
            gapi.load('auth', () => {
                const auth2 = gapi.auth2.init({
                    // eslint-disable-next-line camelcase
                    client_id: vm.$ls.domain.state.pluginOption.client_id,
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
                    onsuccess: onLogIn,
                    onfailure: null,
                });
            });
        });
        return {
            goToAdmin,
            onLogIn,
        };
    },
});
</script>

<style lang="postcss" scoped>
    .subtitle {
        padding-top: 0.5rem;
        font-size: 0.875rem;
    }

    .btn.btn-outline-gray {
        font-size:.875rem;
        font-weight: normal;
    }

    #g-signin-btn {
        padding-top: 1.5rem;
        padding-bottom: 3.5rem;
    }

    .btn-divider {
      display: flex;
      flex-basis: 100%;
      align-items: center;
      color:#DCDDE2;
      font-style: normal;
      font-weight: bold;
      font-size: 0.875rem;
      margin-bottom:1em;
    }
    .btn-divider > span {
        margin:.5rem;
    }
    .btn-divider::before,
    .btn-divider::after {
        content: "";
        flex-grow: 1;
        background: #DCDDE2;
        height: 1px;
        font-size: 0px;
        line-height: 0px;
        margin: 0px 8px;
    }
</style>
