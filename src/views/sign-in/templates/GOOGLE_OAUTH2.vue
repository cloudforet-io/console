<template>
    <div class="google-oauth-wrapper">
        <div id="g-sign-in-btn" />
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    defineComponent, getCurrentInstance, onMounted,
} from '@vue/composition-api';

import { PButton } from '@spaceone/design-system';

import { getAuth2, googleOauthSignOut } from '@/views/common/pages/SignOut.vue';
import { store } from '@/store';

// @ts-ignore
const { gapi } = window;

export default defineComponent({
    name: 'GoogleSignIn',
    components: {
        PButton,
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const signIn = async (googleUser) => {
            const userProfile = googleUser.getBasicProfile();
            const userId = userProfile.getEmail();
            const credentials = {
                // eslint-disable-next-line camelcase
                access_token: googleUser.getAuthResponse().access_token,
            };
            const auth2 = await gapi.auth2.getAuthInstance();
            if (!auth2.isSignedIn.get()) {
                return;
            }
            context.emit('on-sign-in', userId, credentials);
        };
        const signInFail = async () => {
            const auth2 = await getAuth2(store.state.domain.authOptions.client_id);
            await googleOauthSignOut(auth2);
        };
        const goToAdminSignIn = () => {
            context.emit('go-to-admin-sign-in');
        };
        onMounted(async () => {
            gapi.load('auth', () => {
                gapi.auth2.init({
                    // eslint-disable-next-line camelcase
                    client_id: vm.$store.state.domain.authOptions.client_id,
                    // eslint-disable-next-line camelcase
                    fetch_basic_profile: false,
                    scope: 'profile',
                });
                gapi.signin2.render('g-sign-in-btn', {
                    scope: 'email',
                    height: 40,
                    width: 'auto',
                    longtitle: true,
                    onsuccess: signIn,
                    onfailure: signInFail,
                });
            });
        });
        return {
            goToAdminSignIn,
            signIn,
        };
    },
});
</script>

<style lang="postcss" scoped>
#g-sign-in-btn {
    @apply border border-gray-900;
    border-radius: 2px;
    box-shadow: none;
    overflow: hidden;
    >>> .abcRioButtonIcon {
        display: inline-flex;
        float: none;
    }
    >>> .abcRioButtonContents {
        vertical-align: unset;
    }
    >>> span {
        @apply text-gray-900;
        line-height: 40px;
    }
}
</style>
