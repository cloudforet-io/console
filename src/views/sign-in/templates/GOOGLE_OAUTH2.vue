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

import { loadAuth } from '@/views/sign-in/lib/authenticator/loader';

// @ts-ignore
const { gapi } = window;

export default defineComponent({
    name: 'GoogleSignIn',
    components: {
        PButton,
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const onSignIn = () => {
            context.emit('sign-in');
        };
        const goToAdminSignIn = () => {
            context.emit('go-to-admin-sign-in');
        };

        onMounted(async () => {
            try {
                await loadAuth('GOOGLE_OAUTH2').signIn(onSignIn);
            } catch (e) {
                context.emit('sign-in-error');
                console.error(e);
            }
        });
        return {
            goToAdminSignIn,
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
