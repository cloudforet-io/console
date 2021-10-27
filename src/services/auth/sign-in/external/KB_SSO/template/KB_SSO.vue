<template>
    <div class="kbSSO-wrapper">
        <form id="myForm" @submit.prevent="openKBSSO">
            <p-button
                style-type="primary1 outline"
                size="lg"
                class="kbSSO-btn"
            >
                KB SSO
            </p-button>
        </form>
    </div>
</template>

<script lang="ts">
import axios from 'axios';
import {
    ComponentRenderProxy, defineComponent, getCurrentInstance,
} from '@vue/composition-api';
import { PButton } from '@spaceone/design-system';
import { loadAuth } from '@/services/auth/authenticator/loader';

export default defineComponent({
    name: 'KBSignIn',
    components: {
        PButton,
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const openKBSSO = async () => {
            try {
                // window.location.href = '/checkauth.jsp?secureToken=zzzzzz&secureSessionId=xxxx&resultCode=200OK';
                const authOptions =  vm.$store.state.domain.authOptions;
                const formData = new FormData();
                formData.append('agentId', authOptions.agent_id);
                await axios.post(authOptions.authorization_endpoint, formData);
            } catch (e) {
                emit('sign-in-error');
                console.error(e);
            }
        };

        return {
            openKBSSO,
        };
    },
});
</script>

<style lang="postcss" scoped>
.kbSSO-btn {
    width: 100%;
}
</style>
